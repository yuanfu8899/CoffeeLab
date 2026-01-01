import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepositoryService } from '../../services/repository';
import { GoogleSheetsService } from '../../services/google-sheets';
import { BrewLogicService } from '../../services/brew-logic';
import { ExportService } from '../../services/export';
import { BrewMethod, BrewStep } from '../../models/coffee.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-methods',
  imports: [CommonModule, FormsModule],
  templateUrl: './methods.html',
  styleUrl: './methods.css'
})
export class MethodsComponent implements OnInit {
  repo = inject(RepositoryService);
  sheets = inject(GoogleSheetsService);
  exportService = inject(ExportService);
  brewLogic = inject(BrewLogicService);

  methods = this.repo.methods;

  isModalOpen = signal(false);
  isEditing = signal(false);
  isSyncing = signal(false);
  previewDose = signal(20);  // 預覽用粉量（預設 20g）
  inputMode = signal<'cumulative' | 'incremental'>('cumulative');  // 輸入模式：累積/增量

  // Share modal state
  showShareModal = signal(false);
  shareUrl = signal('');

  form: Partial<BrewMethod> = this.getEmptyForm();
  tempSteps: BrewStep[] = [];

  getEmptyForm(): Partial<BrewMethod> {
    return {
      name: '',
      category: 'drip',
      recommendedTemp: 92,
      recommendedRatio: 15,
      description: '',
      steps: []
    };
  }

  openAdd() {
    this.isEditing.set(false);
    this.form = this.getEmptyForm();
    this.tempSteps = [];
    this.isModalOpen.set(true);
  }

  openEdit(method: BrewMethod) {
    this.isEditing.set(true);
    this.form = JSON.parse(JSON.stringify(method));
    this.tempSteps = [...(this.form.steps || [])];
    this.isModalOpen.set(true);
  }

  addStep() {
    this.tempSteps.push({
      name: '新步驟',
      type: 'pour',
      duration: 30,
      waterEndTargetRatio: 1,  // 預設使用倍率模式
      description: ''
    });
  }

  removeStep(index: number) {
    this.tempSteps.splice(index, 1);
  }

  /**
   * 判斷步驟是否使用倍率模式
   */
  isRatioMode(step: BrewStep): boolean {
    // 只要 waterEndTargetRatio 有定義就是倍率模式，不管值是多少
    // 這樣用戶在編輯輸入框時不會意外切換模式
    return step.waterEndTargetRatio !== undefined;
  }

  /**
   * 設置步驟的輸入模式（倍率或絕對值）
   */
  setStepMode(index: number, mode: 'ratio' | 'absolute') {
    const step = this.tempSteps[index];
    if (mode === 'ratio') {
      // 切換到倍率模式：只有在完全未定義時才初始化為 1
      // 如果已經有值（即使是 0），就保持不變
      if (step.waterEndTargetRatio === undefined) {
        step.waterEndTargetRatio = 1;
      }
    } else {
      // 切換到絕對值模式：清除倍率（但保留絕對值）
      step.waterEndTargetRatio = undefined;
      if (step.waterEndTarget === undefined) {
        step.waterEndTarget = 0;
      }
    }
  }

  save() {
    if (!this.form.name) return;
    this.form.steps = this.tempSteps;

    if (this.isEditing() && this.form.id) {
      this.repo.updateMethod(this.form.id, this.form);
      this.syncToCloud('update', this.form);
    } else {
      const newMethod = { ...this.form, id: crypto.randomUUID() } as BrewMethod;
      this.repo.addMethod(newMethod);
      this.syncToCloud('add', newMethod);
    }
    this.isModalOpen.set(false);
  }

  private syncToCloud(action: string, method: any) {
    if (!this.sheets.apiUrl()) return;

    this.isSyncing.set(true);
    this.sheets.submitData('METHOD', method).subscribe(success => {
      this.isSyncing.set(false);
      if (success) {
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: action === 'add' ? '已同步至雲端' : '雲端已更新',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#1e293b',
          color: '#e2e8f0'
        });
      }
    });
  }

  delete(id: string) {
    Swal.fire({
      title: '確定刪除?',
      text: '刪除後無法復原',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '刪除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.repo.deleteMethod(id);
        Swal.fire('已刪除', '本地資料已移除', 'success');
      }
    });
  }

  /**
   * 取得某步驟的增量倍率（用於增量模式顯示）
   */
  getIncrementalRatio(stepIndex: number): number {
    if (stepIndex < 0 || stepIndex >= this.tempSteps.length) return 0;

    return this.brewLogic.getIncrementalRatio(this.tempSteps, stepIndex) || 0;
  }

  /**
   * 設定某步驟的增量倍率（增量模式輸入時）
   * 自動更新累積倍率以保持資料一致性
   */
  setIncrementalRatio(stepIndex: number, incrementalRatio: number): void {
    if (stepIndex < 0 || stepIndex >= this.tempSteps.length) return;

    // 計算新的累積倍率
    const previousCumulative = stepIndex > 0
      ? (this.tempSteps[stepIndex - 1].waterEndTargetRatio || 0)
      : 0;

    const newCumulative = previousCumulative + incrementalRatio;

    // 更新當前步驟的累積倍率
    this.tempSteps[stepIndex].waterEndTargetRatio = newCumulative;

    // 如果有後續步驟，需要遞迴調整它們的累積倍率
    this.recalculateSubsequentSteps(stepIndex + 1);
  }

  /**
   * 重新計算後續步驟的累積倍率（當修改增量時需要）
   */
  private recalculateSubsequentSteps(fromIndex: number): void {
    // 保持後續步驟的增量倍率不變，但更新累積倍率
    for (let i = fromIndex; i < this.tempSteps.length; i++) {
      const incrementalRatio = this.getIncrementalRatio(i);
      const previousCumulative = this.tempSteps[i - 1].waterEndTargetRatio || 0;
      this.tempSteps[i].waterEndTargetRatio = previousCumulative + incrementalRatio;
    }
  }

  // === Share & Export Methods ===

  ngOnInit() {
    this.checkImportFromUrl();
  }

  // Export method to JSON file
  exportMethod(method: BrewMethod) {
    this.exportService.exportMethod(method);
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      title: '已下載 JSON 檔案',
      showConfirmButton: false,
      timer: 2000,
      background: '#1e293b',
      color: '#e2e8f0'
    });
  }

  // Share method (generate link)
  shareMethod(method: BrewMethod) {
    const url = this.exportService.generateShareLink(method);
    this.shareUrl.set(url);
    this.showShareModal.set(true);
  }

  // Copy to clipboard
  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '已複製連結',
        showConfirmButton: false,
        timer: 2000,
        background: '#1e293b',
        color: '#e2e8f0'
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '複製失敗',
        text: '請手動複製連結',
        confirmButtonColor: '#f59e0b'
      });
    }
  }

  // Import method from file
  async importMethod() {
    try {
      const method = await this.exportService.importMethodFromFile();
      this.repo.addMethod(method);
      Swal.fire({
        icon: 'success',
        title: '匯入成功',
        text: `已匯入手法：${method.name}`,
        confirmButtonColor: '#f59e0b'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: '匯入失敗',
        text: err.message || '無法讀取 JSON 檔案',
        confirmButtonColor: '#f59e0b'
      });
    }
  }

  // Check URL for import on init
  private checkImportFromUrl() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const importData = urlParams.get('import');

    if (importData) {
      const method = this.exportService.parseShareLink(importData);
      if (method) {
        Swal.fire({
          title: '匯入手法',
          text: `是否要匯入「${method.name}」？`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '匯入',
          cancelButtonText: '取消',
          confirmButtonColor: '#f59e0b'
        }).then((result) => {
          if (result.isConfirmed) {
            this.repo.addMethod(method);
            Swal.fire({
              icon: 'success',
              title: '匯入成功',
              text: `已加入手法：${method.name}`,
              confirmButtonColor: '#f59e0b'
            });
            // Clear URL param
            window.history.replaceState({}, '', window.location.pathname + '#/methods');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: '匯入失敗',
          text: '無效的分享連結',
          confirmButtonColor: '#f59e0b'
        });
      }
    }
  }
}
