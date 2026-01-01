import { Injectable, signal, effect } from '@angular/core';
import { BrewMethod, CoffeeBean, GrinderProfile, BrewRecord } from '../models/coffee.types';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  private readonly STORAGE_KEY_BEANS = 'coffee_lab_beans';
  private readonly STORAGE_KEY_METHODS = 'coffee_lab_methods';
  private readonly STORAGE_KEY_GRINDERS = 'coffee_lab_grinders';
  private readonly STORAGE_KEY_RECORDS = 'coffee_lab_records';

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

  private defaultMethods: BrewMethod[] = [
    {
      id: 'method-ratio-based',
      name: 'V60 四段注水 (比例式)',
      category: 'drip',
      recommendedTemp: 92,
      recommendedRatio: 15,
      description: '適用 1:15 粉水比，使用倍率自動計算水量。建議粉量 15-20g。',
      steps: [
        {
          name: '悶蒸',
          type: 'pour',
          waterEndTargetRatio: 2,
          duration: 30,
          description: '輕柔注水，確保粉層濕潤'
        },
        {
          name: '第一段',
          type: 'pour',
          waterEndTargetRatio: 6,
          duration: 40,
          description: '中心繞圈至外圍'
        },
        {
          name: '第二段',
          type: 'pour',
          waterEndTargetRatio: 12,
          duration: 40,
          description: '穩定水流，保持粉床平整'
        },
        {
          name: '第三段',
          type: 'pour',
          waterEndTargetRatio: 15,
          duration: 40,
          description: '最後注水至目標總重'
        }
      ]
    },
    {
      id: 'method-clever-dripper',
      name: '聰明濾杯（浸泡式）',
      category: 'hybrid',
      recommendedTemp: 90,
      recommendedRatio: 15,
      description: '浸泡式萃取，風味均衡穩定。適合 15-18g 粉量。',
      steps: [
        {
          name: '注水',
          type: 'pour',
          waterEndTargetRatio: 15,
          duration: 30,
          description: '一次注入所有水量，確保粉層充分濕潤'
        },
        {
          name: '浸泡',
          type: 'wait',
          duration: 120,
          description: '等待萃取，可輕攪拌促進均勻'
        },
        {
          name: '放水',
          type: 'wait',
          duration: 60,
          description: '打開底閥，開始過濾'
        }
      ]
    },
    {
      id: 'method-one-pour',
      name: '一刀流（快速沖煮）',
      category: 'drip',
      recommendedTemp: 90,
      recommendedRatio: 15,
      description: '簡單快速，適合中深焙豆。建議 15-20g 粉量。',
      steps: [
        {
          name: '悶蒸',
          type: 'pour',
          waterEndTargetRatio: 3,
          duration: 30,
          description: '快速悶蒸，粉量 × 3'
        },
        {
          name: '主水流',
          type: 'pour',
          waterEndTargetRatio: 15,
          duration: 90,
          description: '穩定水流一次注完至目標總重'
        }
      ]
    }
  ];

  // Signals
  beans = signal<CoffeeBean[]>(this.load(this.STORAGE_KEY_BEANS, []));
  methods = signal<BrewMethod[]>(this.load(this.STORAGE_KEY_METHODS, this.defaultMethods));
  grinders = signal<GrinderProfile[]>(this.load(this.STORAGE_KEY_GRINDERS, this.defaultGrinders));
  records = signal<BrewRecord[]>(this.load(this.STORAGE_KEY_RECORDS, []));

  constructor() {
    // Auto-save effects
    effect(() => localStorage.setItem(this.STORAGE_KEY_BEANS, JSON.stringify(this.beans())));
    effect(() => localStorage.setItem(this.STORAGE_KEY_METHODS, JSON.stringify(this.methods())));
    effect(() => localStorage.setItem(this.STORAGE_KEY_GRINDERS, JSON.stringify(this.grinders())));
    effect(() => localStorage.setItem(this.STORAGE_KEY_RECORDS, JSON.stringify(this.records())));
  }

  private load<T>(key: string, defaultData: T): T {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    
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

  // Records (Brew Logs)
  addRecord(record: BrewRecord) {
    // 新增紀錄到列表開頭（最新的在最上面）
    this.records.update(list => [record, ...list]);
    return record;
  }

  updateRecord(id: string, updates: Partial<BrewRecord>) {
    this.records.update(list => list.map(r => r.id === id ? { ...r, ...updates } : r));
  }

  deleteRecord(id: string) {
    this.records.update(list => list.filter(r => r.id !== id));
  }

  // 同步雲端資料到本地（合併策略：雲端資料優先，但保留本地獨有資料）
  syncRecordsFromCloud(cloudRecords: BrewRecord[]) {
    const localRecords = this.records();
    const cloudIds = new Set(cloudRecords.map(r => r.id));

    // 保留本地獨有的紀錄（雲端沒有的）
    const localOnlyRecords = localRecords.filter(r => !cloudIds.has(r.id));

    // 合併：雲端資料 + 本地獨有資料
    const merged = [...cloudRecords, ...localOnlyRecords];

    // 按日期排序（最新在前）
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.records.set(merged);
  }

  // Load sample data for onboarding
  loadSampleData() {
    const sampleBeans: CoffeeBean[] = [
      {
        id: crypto.randomUUID(),
        name: '耶加雪菲 G1 水洗',
        roastLevel: 'light',
        shop: '衣索比亞',
        purchaseDate: new Date().toISOString(),
        weight: 250,
        flavorNotes: ['花香', '柑橘', '紅茶'],
        isActive: true
      },
      {
        id: crypto.randomUUID(),
        name: '哥倫比亞 慧蘭',
        roastLevel: 'medium',
        shop: '哥倫比亞',
        purchaseDate: new Date().toISOString(),
        weight: 250,
        flavorNotes: ['堅果', '焦糖', '巧克力'],
        isActive: true
      }
    ];

    this.beans.set(sampleBeans);

    // Show success message
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        icon: 'success',
        title: '範例資料已載入',
        text: '已加入 2 個範例咖啡豆，現在可以開始使用 Timer 了！',
        confirmButtonColor: '#f59e0b',
        background: '#1e293b',
        color: '#e2e8f0'
      });
    });
  }

  // Helpers
  getBean(id: string) { return this.beans().find(b => b.id === id); }
  getMethod(id: string) { return this.methods().find(m => m.id === id); }
  getGrinder(id: string) { return this.grinders().find(g => g.id === id); }
  getRecord(id: string) { return this.records().find(r => r.id === id); }
}