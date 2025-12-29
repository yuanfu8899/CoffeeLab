import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepositoryService } from '../../services/repository';
import { GoogleSheetsService } from '../../services/google-sheets';
import { BrewMethod, BrewStep } from '../../models/coffee.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-methods',
  imports: [CommonModule, FormsModule],
  templateUrl: './methods.html',
  styleUrl: './methods.css'
})
export class MethodsComponent {
  repo = inject(RepositoryService);
  sheets = inject(GoogleSheetsService);
  methods = this.repo.methods;

  isModalOpen = signal(false);
  isEditing = signal(false);
  isSyncing = signal(false);
  
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
      waterEndTarget: 0,
      description: ''
    });
  }

  removeStep(index: number) {
    this.tempSteps.splice(index, 1);
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
}
