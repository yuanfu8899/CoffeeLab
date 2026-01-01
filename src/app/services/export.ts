import { Injectable } from '@angular/core';
import { BrewMethod } from '../models/coffee.types';

@Injectable({ providedIn: 'root' })
export class ExportService {

  // Export single method to JSON file
  exportMethod(method: BrewMethod): void {
    const json = JSON.stringify(method, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${method.name.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import method from JSON file
  importMethodFromFile(): Promise<BrewMethod> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const method = JSON.parse(event.target.result);
            if (this.validateMethod(method)) {
              // Generate new ID to avoid conflicts
              method.id = crypto.randomUUID();
              resolve(method);
            } else {
              reject(new Error('Invalid method format'));
            }
          } catch (err) {
            reject(new Error('Failed to parse JSON'));
          }
        };
        reader.readAsText(file);
      };

      input.click();
    });
  }

  // Generate shareable link (Base64 encoded)
  generateShareLink(method: BrewMethod): string {
    const json = JSON.stringify(method);
    const encoded = btoa(encodeURIComponent(json));
    return `${window.location.origin}${window.location.pathname}#/methods?import=${encoded}`;
  }

  // Parse share link
  parseShareLink(encodedData: string): BrewMethod | null {
    try {
      const json = decodeURIComponent(atob(encodedData));
      const method = JSON.parse(json);
      if (this.validateMethod(method)) {
        method.id = crypto.randomUUID(); // New ID
        return method;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Validate method structure
  private validateMethod(method: any): boolean {
    return method &&
           typeof method.name === 'string' &&
           typeof method.category === 'string' &&
           Array.isArray(method.steps) &&
           method.steps.length > 0 &&
           method.steps.every((s: any) =>
             typeof s.name === 'string' &&
             typeof s.type === 'string' &&
             typeof s.duration === 'number'
           );
  }
}
