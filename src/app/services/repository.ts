import { Injectable, signal, effect } from '@angular/core';
import { BrewMethod, CoffeeBean, GrinderProfile } from '../models/coffee.types';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  private readonly STORAGE_KEY_BEANS = 'coffee_lab_beans';
  private readonly STORAGE_KEY_METHODS = 'coffee_lab_methods';
  private readonly STORAGE_KEY_GRINDERS = 'coffee_lab_grinders';

  // Default Data
  private defaultGrinders: GrinderProfile[] = [
    {
      id: 'g2',
      name: '泰摩 S3',
      defaultSetting: 7,
      minSetting: 0,
      maxSetting: 9,
      step: 0.1,
      ranges: { espresso: [0.5, 1.5], pourOver: [5.5, 7.5], frenchPress: [8.0, 9.0] }
    },
    {
      id: 'g1',
      name: '小飛馬 600N',
      defaultSetting: 4,
      minSetting: 1,
      maxSetting: 8,
      step: 0.5,
      ranges: { espresso: [1.5, 2.5], pourOver: [3.5, 4.5], frenchPress: [5.5, 6.5] }
    }
  ];

  // Signals
  beans = signal<CoffeeBean[]>(this.load(this.STORAGE_KEY_BEANS, []));
  methods = signal<BrewMethod[]>(this.load(this.STORAGE_KEY_METHODS, []));
  grinders = signal<GrinderProfile[]>(this.load(this.STORAGE_KEY_GRINDERS, this.defaultGrinders));
  
  constructor() {
    // Auto-save effects
    effect(() => localStorage.setItem(this.STORAGE_KEY_BEANS, JSON.stringify(this.beans())));
    effect(() => localStorage.setItem(this.STORAGE_KEY_METHODS, JSON.stringify(this.methods())));
    effect(() => localStorage.setItem(this.STORAGE_KEY_GRINDERS, JSON.stringify(this.grinders())));
  }

  private load<T>(key: string, defaultData: T): T {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    
    // For beans and methods, if empty and first time, maybe return empty or a small default
    if (key === this.STORAGE_KEY_BEANS && !saved) return [] as any; 
    if (key === this.STORAGE_KEY_METHODS && !saved) return [] as any;
    
    return defaultData;
  }

  // --- CRUD Operations ---

  // Grinders
  addGrinder(grinder: Omit<GrinderProfile, 'id'>) {
    const newGrinder = { ...grinder, id: crypto.randomUUID() };
    this.grinders.update(list => [newGrinder, ...list]);
    return newGrinder;
  }

  updateGrinder(id: string, updates: Partial<GrinderProfile>) {
    this.grinders.update(list => list.map(g => g.id === id ? { ...g, ...updates } : g));
  }

  deleteGrinder(id: string) {
    this.grinders.update(list => list.filter(g => g.id !== id));
  }

  // Beans
  addBean(bean: Omit<CoffeeBean, 'id'>) {
    const newBean = { ...bean, id: crypto.randomUUID() };
    this.beans.update(list => [newBean, ...list]);
  }

  updateBean(id: string, updates: Partial<CoffeeBean>) {
    this.beans.update(list => list.map(b => b.id === id ? { ...b, ...updates } : b));
  }

  deleteBean(id: string) {
    this.beans.update(list => list.filter(b => b.id !== id));
  }

  // Methods
  addMethod(method: Omit<BrewMethod, 'id'>) {
    const newMethod = { ...method, id: crypto.randomUUID() };
    this.methods.update(list => [newMethod, ...list]);
  }

  updateMethod(id: string, updates: Partial<BrewMethod>) {
    this.methods.update(list => list.map(m => m.id === id ? { ...m, ...updates } : m));
  }

  deleteMethod(id: string) {
    this.methods.update(list => list.filter(m => m.id !== id));
  }
  
  // Helpers
  getBean(id: string) { return this.beans().find(b => b.id === id); }
  getMethod(id: string) { return this.methods().find(m => m.id === id); }
  getGrinder(id: string) { return this.grinders().find(g => g.id === id); }
}