import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, effect } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SyncStatus {
  isConnected: boolean;
  lastSyncTime: string | null;
  lastSyncResult: 'success' | 'error' | 'pending' | null;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'coffee_lab_api_url';
  private readonly SYNC_STATUS_KEY = 'coffee_lab_last_sync';

  apiUrl = signal<string>(localStorage.getItem(this.STORAGE_KEY) || '');

  syncStatus = signal<SyncStatus>({
    isConnected: false,
    lastSyncTime: null,
    lastSyncResult: null
  });

  constructor() {
    this.loadSyncStatus();

    // Monitor connection status
    effect(() => {
      this.syncStatus.update(s => ({
        ...s,
        isConnected: this.apiUrl().length > 0
      }));
    });
  }

  setApiUrl(url: string) {
    this.apiUrl.set(url);
    localStorage.setItem(this.STORAGE_KEY, url);
  }

  clearApiUrl() {
    this.apiUrl.set('');
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 依照後端 code.gs 規範發送資料
   * @param type 'LOG' | 'BEAN' | 'GRINDER' | 'METHOD'
   * @param data 實際資料物件
   */
  submitData(type: 'LOG' | 'BEAN' | 'GRINDER' | 'METHOD', data: any): Observable<boolean> {
    const url = this.apiUrl();
    if (!url) return of(false);

    // Set pending status
    this.syncStatus.update(s => ({ ...s, lastSyncResult: 'pending' }));

    // 包裝成後端期待的格式
    const payload = {
      type: type,
      data: data
    };

    return this.http.post(url, JSON.stringify(payload), { responseType: 'text' }).pipe(
      map(response => {
        try {
          // 嘗試解析後端回傳的 JSON (雖然 responseType 是 text)
          const res = JSON.parse(response);
          const success = res.status === 'success';
          this.updateSyncStatus(success);
          return success;
        } catch (e) {
          // 如果後端回傳的是純文字但狀態碼是 200，通常也算成功
          this.updateSyncStatus(true);
          return true;
        }
      }),
      catchError((error) => {
        this.updateSyncStatus(false, error.message);
        return of(false);
      })
    );
  }

  /**
   * 從雲端讀取所有資料 (同步功能)
   */
  getAllData(): Observable<any> {
    const url = this.apiUrl();
    if (!url) return of(null);

    // 呼叫 doGet?action=getAll
    return this.http.get(`${url}?action=getAll`).pipe(
      catchError(() => of(null))
    );
  }

  private updateSyncStatus(success: boolean, errorMessage?: string) {
    const status: SyncStatus = {
      isConnected: true,
      lastSyncTime: new Date().toISOString(),
      lastSyncResult: success ? 'success' : 'error',
      errorMessage: success ? undefined : errorMessage
    };
    this.syncStatus.set(status);
    localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(status));
  }

  private loadSyncStatus() {
    const saved = localStorage.getItem(this.SYNC_STATUS_KEY);
    if (saved) {
      try {
        const status = JSON.parse(saved);
        this.syncStatus.set(status);
      } catch (e) {
        console.error('Failed to load sync status', e);
      }
    }
  }

  formatSyncTime(isoTime: string | null): string {
    if (!isoTime) return '';
    const date = new Date(isoTime);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes} 分鐘前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} 小時前`;
    return `${Math.floor(minutes / 1440)} 天前`;
  }
}

