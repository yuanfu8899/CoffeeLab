import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepositoryService } from '../../services/repository';
import { GoogleSheetsService } from '../../services/google-sheets';
import { CoffeeBean } from '../../models/coffee.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-beans',
  imports: [CommonModule, FormsModule],
  templateUrl: './beans.html',
  styleUrl: './beans.css'
})
export class BeansComponent {
  repo = inject(RepositoryService);
  sheets = inject(GoogleSheetsService);
  beans = this.repo.beans;

  isModalOpen = signal(false);
  isEditing = signal(false);
  isSyncing = signal(false);
  
  // Form Model
  form: Partial<CoffeeBean> = {
    name: '',
    roastLevel: 'medium',
    shop: '',
    weight: 200,
    flavorNotes: [],
    purchaseDate: new Date().toISOString().split('T')[0],
    isActive: true
  };
  flavorInput = '';

  openAdd() {
    this.isEditing.set(false);
    this.form = {
      name: '',
      roastLevel: 'medium',
      shop: '',
      weight: 200,
      flavorNotes: [],
      purchaseDate: new Date().toISOString().split('T')[0],
      isActive: true
    };
    this.flavorInput = '';
    this.isModalOpen.set(true);
  }

  openEdit(bean: CoffeeBean) {
    this.isEditing.set(true);
    this.form = { ...bean };
    this.flavorInput = bean.flavorNotes.join(', ');
    this.isModalOpen.set(true);
  }

  save() {
    if (!this.form.name) return;
    
    // Parse flavors
    const flavors = this.flavorInput.split(/[,，]/).map(f => f.trim()).filter(f => f);
    this.form.flavorNotes = flavors;

    if (this.isEditing() && this.form.id) {
      this.repo.updateBean(this.form.id, this.form);
      this.isModalOpen.set(false);
      this.syncToCloud('update', this.form);
    } else {
      const newBean = { ...this.form, id: crypto.randomUUID() } as CoffeeBean;
      this.repo.addBean(newBean);
      this.isModalOpen.set(false);
      this.syncToCloud('add', newBean);
    }
  }

  private syncToCloud(action: string, bean: any) {
    if (!this.sheets.apiUrl()) return;

    // 格式化資料以配合 code.gs: flavorNotes 須為字串
    const dataToSync = {
      ...bean,
      flavorNotes: Array.isArray(bean.flavorNotes) ? bean.flavorNotes.join(', ') : bean.flavorNotes
    };

    this.isSyncing.set(true);
    this.sheets.submitData('BEAN', dataToSync).subscribe(success => {
      this.isSyncing.set(false);
      if (success) {
        // Toast Notification
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: action === 'add' ? '已同步至雲端' : '雲端已更新',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#1e293b', // slate-800
          color: '#e2e8f0' // slate-200
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
        this.repo.deleteBean(id);
        Swal.fire('已刪除', '本地資料已移除 (雲端需手動處理)', 'success');
      }
    });
  }
}
