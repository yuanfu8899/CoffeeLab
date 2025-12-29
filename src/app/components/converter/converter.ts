import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepositoryService } from '../../services/repository';

@Component({
  selector: 'app-converter',
  imports: [CommonModule],
  templateUrl: './converter.html',
  styleUrl: './converter.css'
})
export class ConverterComponent {
  private repo = inject(RepositoryService);

  // Supported methods for the view (mapped from our custom ranges extension)
  brewMethods = ['espresso', 'pourOver', 'frenchPress'] as const;
  
  methodLabels: Record<string, string> = {
    espresso: '義式濃縮',
    pourOver: '手沖',
    frenchPress: '法壓'
  };
  
  selectedMethod = signal<typeof this.brewMethods[number]>('pourOver');

  grinders = computed(() => {
    const method = this.selectedMethod();
    return this.repo.grinders().map(g => {
      // Access the optional 'ranges' property we added for compatibility
      const range = g.ranges ? g.ranges[method] : null;
      return {
        name: g.name,
        range: range ? `${range[0]} - ${range[1]}` : '未定義',
        description: `範圍: ${g.minSetting} - ${g.maxSetting} (每格 ${g.step})`
      };
    });
  });

  selectMethod(method: typeof this.brewMethods[number]) {
    this.selectedMethod.set(method);
  }
  
  formatMethodName(method: string): string {
    return this.methodLabels[method] || method;
  }
}
