import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSheetsService } from '../../services/google-sheets';
import { RepositoryService } from '../../services/repository';
import { GrinderProfile } from '../../models/coffee.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent {
  sheetsService = inject(GoogleSheetsService);
  repo = inject(RepositoryService);
  
  apiUrl = '';
  
  // Grinder Management State
  grinders = this.repo.grinders;
  isModalOpen = signal(false);
  isEditing = signal(false);
  form: Partial<GrinderProfile> = {};

  constructor() {
    this.apiUrl = this.sheetsService.apiUrl();
  }

  saveConfig() {
    this.sheetsService.setApiUrl(this.apiUrl);
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      title: '設定已儲存',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#1e293b',
      color: '#e2e8f0'
    });
  }

  // Grinder CRUD
  openAddGrinder() {
    this.isEditing.set(false);
    this.form = {
      name: '',
      defaultSetting: 0,
      minSetting: 0,
      maxSetting: 10,
      step: 0.1
    };
    this.isModalOpen.set(true);
  }

  openEditGrinder(g: GrinderProfile) {
    this.isEditing.set(true);
    this.form = { ...g };
    this.isModalOpen.set(true);
  }

  saveGrinder() {
    if (!this.form.name) return;

    if (this.isEditing() && this.form.id) {
      this.repo.updateGrinder(this.form.id, this.form);
      this.syncGrinderToCloud('update', this.form);
    } else {
      const newGrinder = this.repo.addGrinder(this.form as GrinderProfile);
      this.syncGrinderToCloud('add', newGrinder);
    }
    this.isModalOpen.set(false);
  }

  private syncGrinderToCloud(action: string, grinder: any) {
    if (!this.sheetsService.apiUrl()) return;
    this.sheetsService.submitData('GRINDER', grinder).subscribe(success => {
      if (success) {
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: action === 'add' ? '磨豆機已同步' : '磨豆機已更新',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#1e293b',
          color: '#e2e8f0'
        });
      }
    });
  }

  deleteGrinder(id: string) {
    Swal.fire({
      title: '確定刪除磨豆機?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444'
    }).then(r => {
      if (r.isConfirmed) this.repo.deleteGrinder(id);
    });
  }
}
