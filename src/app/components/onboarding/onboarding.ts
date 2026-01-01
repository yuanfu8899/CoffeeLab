import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepositoryService } from '../../services/repository';

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css'
})
export class OnboardingComponent {
  private readonly ONBOARDING_KEY = 'coffee_lab_onboarding_completed';
  private repo = inject(RepositoryService);

  showOnboarding = signal<boolean>(!localStorage.getItem(this.ONBOARDING_KEY));
  currentStep = signal<number>(0);

  steps = [
    {
      title: '歡迎使用 CoffeeLab',
      description: '專為手沖咖啡愛好者打造的沖煮助手',
      icon: '☕'
    },
    {
      title: '智能計時器',
      description: '選擇沖煮方法，跟隨步驟指引，享受完美沖煮體驗',
      icon: '⏱️'
    },
    {
      title: '雲端同步 (可選)',
      description: '設定 Google Sheets API 同步您的資料到雲端',
      icon: '☁️'
    },
    {
      title: '載入範例資料',
      description: '點擊下方按鈕載入範例豆子和手法，快速體驗功能',
      icon: '🎯'
    }
  ];

  nextStep() {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    } else {
      this.complete();
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  skip() {
    this.complete();
  }

  loadSampleData() {
    this.repo.loadSampleData();
    this.complete();
  }

  complete() {
    localStorage.setItem(this.ONBOARDING_KEY, 'true');
    this.showOnboarding.set(false);
  }
}
