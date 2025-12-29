import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'coffee_lab_api_url';
  
  apiUrl = signal<string>(localStorage.getItem(this.STORAGE_KEY) || '');

  constructor() { }

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
          return res.status === 'success';
        } catch (e) {
          // 如果後端回傳的是純文字但狀態碼是 200，通常也算成功
          return true;
        }
      }),
      catchError(() => of(false))
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
}

