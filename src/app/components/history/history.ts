import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSheetsService } from '../../services/google-sheets';
import { RepositoryService } from '../../services/repository';
import { BrewRecord, SensoryProfile } from '../../models/coffee.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryComponent {
  private sheetsService = inject(GoogleSheetsService);
  private repo = inject(RepositoryService);

  // Sync status
  syncStatus = this.sheetsService.syncStatus;
  canSubmit = computed(() => this.sheetsService.apiUrl().length > 0);

  // Tab state
  activeTab = signal<'add' | 'list'>('add');

  // Records list state (使用 repo.records，從 LocalStorage 自動載入)
  isLoadingRecords = signal<boolean>(false);
  filterText = signal<string>('');
  filterDateRange = signal<'week' | 'month' | 'all'>('all');

  // Filtered records (直接使用 repo.records)
  filteredRecords = computed(() => {
    const records = this.repo.records();
    const text = this.filterText().toLowerCase();
    const dateRange = this.filterDateRange();

    return records.filter(r => {
      // Text filter
      const matchesText = !text ||
        r.beanName?.toLowerCase().includes(text) ||
        this.getMethodName(r.methodId).toLowerCase().includes(text) ||
        r.notes?.toLowerCase().includes(text);

      // Date range filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        const recordDate = new Date(r.date);
        const now = new Date();
        const daysAgo = dateRange === 'week' ? 7 : 30;
        const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        matchesDate = recordDate >= cutoff;
      }

      return matchesText && matchesDate;
    });
  });

  // Data Sources
  beans = this.repo.beans;
  methods = this.repo.methods;
  grinders = this.repo.grinders;

  // Form State
  record: Partial<BrewRecord> = {
    date: new Date().toISOString(),
    beanId: '',
    methodId: '',
    grinderId: '',
    settingUsed: 0,
    beanWeight: 15,
    waterWeight: 225,
    temperature: 92,
    totalTime: '02:30',
    notes: ''
  };

  sensory: SensoryProfile = {
    aroma: 3,
    acidity: 3,
    sweetness: 3,
    body: 3,
    aftertaste: 3,
    balance: 3,
    overall: 3
  };

  isSubmitting = false;

  constructor() {
    // Set defaults if available
    if (this.beans().length) this.record.beanId = this.beans()[0].id;
    if (this.methods().length) this.record.methodId = this.methods()[0].id;
    
    // Default to '泰摩' if found
    const timemore = this.grinders().find(g => g.name.includes('泰摩'));
    if (timemore) {
       this.record.grinderId = timemore.id;
       this.record.settingUsed = timemore.defaultSetting;
    } else if (this.grinders().length) {
       this.record.grinderId = this.grinders()[0].id;
       this.record.settingUsed = this.grinders()[0].defaultSetting;
    }
  }

  submit() {
    this.isSubmitting = true;

    // Snapshot names for the record (in case IDs change later)
    const beanName = this.repo.getBean(this.record.beanId!)?.name || 'Unknown Bean';

    const finalRecord: BrewRecord = {
      ...this.record as BrewRecord,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      beanName: beanName,
      sensory: this.sensory
    };

    // 1. 總是先儲存到本地
    this.repo.addRecord(finalRecord);

    // 2. 如果有 API，同步到雲端
    if (this.sheetsService.apiUrl()) {
      this.sheetsService.submitData('LOG', finalRecord).subscribe(success => {
        this.isSubmitting = false;
        if (success) {
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: '已儲存本地 + 雲端同步成功',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#1e293b',
            color: '#e2e8f0'
          });
        } else {
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'warning',
            title: '已儲存本地，但雲端同步失敗',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#1e293b',
            color: '#e2e8f0'
          });
        }
      });
    } else {
      // 沒有 API，只存本地
      this.isSubmitting = false;
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '已儲存到本地',
        text: '可在設定頁面配置雲端同步',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1e293b',
        color: '#e2e8f0'
      });
    }
  }

  // 從雲端同步紀錄（合併到本地）
  loadRecords() {
    // 本地資料已經自動顯示，這個方法只負責從雲端同步
    if (!this.sheetsService.apiUrl()) {
      // 沒有 API，顯示本地資料即可（已自動顯示）
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'info',
        title: '顯示本地紀錄',
        text: '可在設定頁面配置雲端同步',
        showConfirmButton: false,
        timer: 2000,
        background: '#1e293b',
        color: '#e2e8f0'
      });
      return;
    }

    this.isLoadingRecords.set(true);
    this.sheetsService.getAllData().subscribe({
      next: (data) => {
        if (data?.logs) {
          // 從雲端同步資料並合併到本地
          this.repo.syncRecordsFromCloud(data.logs);
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: '已從雲端同步',
            showConfirmButton: false,
            timer: 2000,
            background: '#1e293b',
            color: '#e2e8f0'
          });
        }
        this.isLoadingRecords.set(false);
      },
      error: (err) => {
        console.error('Failed to load records', err);
        this.isLoadingRecords.set(false);
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'warning',
          title: '雲端同步失敗',
          text: '顯示本地紀錄',
          showConfirmButton: false,
          timer: 3000,
          background: '#1e293b',
          color: '#e2e8f0'
        });
      }
    });
  }

  // Helper methods
  getMethodName(methodId: string): string {
    return this.repo.getMethod(methodId)?.name || '未知手法';
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
