import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepositoryService } from '../../services/repository';
import { BrewLogicService } from '../../services/brew-logic';
import { BrewStep, BrewMethod } from '../../models/coffee.types';
import { Subscription, interval } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-timer',
  imports: [CommonModule, FormsModule],
  templateUrl: './timer.html',
  styleUrl: './timer.css'
})
export class TimerComponent implements OnDestroy {
  private repo = inject(RepositoryService);
  private brewLogic = inject(BrewLogicService);

  // Selections
  methods = this.repo.methods;
  selectedMethodId = signal<string>(this.methods()[0]?.id || '');
  selectedMethod = computed(() => this.repo.getMethod(this.selectedMethodId()));

  // Inputs
  beanWeight = signal(15); // grams

  // Calculator Output
  brewParams = computed(() => {
    const m = this.selectedMethod();
    if (!m) return { waterWeight: 0, temp: 0, ratio: 0 };
    return {
      waterWeight: this.beanWeight() * m.recommendedRatio,
      temp: m.recommendedTemp,
      ratio: `1:${m.recommendedRatio}`
    };
  });

  // Timer State
  status = signal<'idle' | 'running' | 'paused' | 'finished'>('idle');
  time = signal(0); // seconds
  timerSubscription?: Subscription;

  // Dynamic Steps Logic
  currentStepIndex = computed(() => {
    const t = this.time();
    const steps = this.selectedMethod()?.steps || [];
    let accumulatedTime = 0;
    
    for (let i = 0; i < steps.length; i++) {
      accumulatedTime += steps[i].duration;
      if (t < accumulatedTime) return i;
    }
    return steps.length > 0 ? steps.length - 1 : 0;
  });

  currentStep = computed<BrewStep | undefined>(() => {
    const steps = this.selectedMethod()?.steps;
    return steps ? steps[this.currentStepIndex()] : undefined;
  });

  // Effective water target for current step
  currentStepWaterTarget = computed(() => {
    const step = this.currentStep();
    if (!step) return undefined;
    return this.brewLogic.getEffectiveWaterTarget(step, this.beanWeight());
  });

  // Get effective water target for any step
  getStepWaterTarget(step: BrewStep): number | undefined {
    return this.brewLogic.getEffectiveWaterTarget(step, this.beanWeight());
  }
  
  // Progress Calculation
  progress = computed(() => {
    const steps = this.selectedMethod()?.steps || [];
    const totalDuration = steps.reduce((acc, s) => acc + s.duration, 0);
    if (totalDuration === 0) return 0;
    return Math.min((this.time() / totalDuration) * 100, 100);
  });

  // Helpers
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  toggleTimer() {
    if (this.status() === 'running') this.pause();
    else this.start();
  }

  start() {
    if (this.status() === 'finished') this.reset();
    this.status.set('running');
    this.timerSubscription = interval(1000).subscribe(() => {
      this.time.update(t => t + 1);
      this.checkStepTransition();
    });
  }

  pause() {
    this.status.set('paused');
    this.timerSubscription?.unsubscribe();
  }

  reset() {
    this.pause();
    this.status.set('idle');
    this.time.set(0);
    this.lastStepIndex = -1;
  }

  private lastStepIndex = -1;
  checkStepTransition() {
    const index = this.currentStepIndex();
    if (index !== this.lastStepIndex) {
      if (this.lastStepIndex !== -1) this.playBeep(); 
      this.lastStepIndex = index;
    }
    
    // Check finish
    const steps = this.selectedMethod()?.steps || [];
    const totalDuration = steps.reduce((acc, s) => acc + s.duration, 0);
    
    if (this.time() >= totalDuration && this.status() === 'running') {
       this.playBeep();
       setTimeout(() => this.playBeep(), 200); // Double beep
       this.status.set('finished');
       this.pause();
       this.showFinishAlert();
    }
  }

  playBeep() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1000;
      osc.type = 'sine';
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.error('Audio error', e);
    }
  }
  
  showFinishAlert() {
    Swal.fire({
      title: '沖煮完成！',
      text: '請前往「沖煮紀錄」分頁手動記錄本次結果。',
      icon: 'success',
      confirmButtonColor: '#f59e0b',
    });
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }
}
