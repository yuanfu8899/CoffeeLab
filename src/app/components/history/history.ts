import { Component, inject } from '@angular/core';
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
    if (!this.sheetsService.apiUrl()) {
      Swal.fire({
        title: '缺少設定',
        text: '請先在「設定」頁面配置 Google Sheets API URL。',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

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

    this.sheetsService.submitData('LOG', finalRecord).subscribe(success => {
      this.isSubmitting = false;
      if (success) {
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: '紀錄已儲存至雲端',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#1e293b',
          color: '#e2e8f0'
        });
      } else {
        Swal.fire({
          title: '儲存失敗',
          text: '請檢查 API URL 或網路連線。',
          icon: 'error',
          confirmButtonColor: '#f59e0b',
        });
      }
    });
  }
}
