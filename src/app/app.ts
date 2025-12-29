import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { GoogleSheetsService } from './services/google-sheets';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  title = 'coffee-lab';
  private sheets = inject(GoogleSheetsService);
  private router = inject(Router);

  ngOnInit() {
    // Check if API URL is configured
    if (!this.sheets.apiUrl()) {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'info',
        title: '尚未連結 Google Sheets',
        text: '點擊此處前往設定，以啟用雲端同步功能。',
        showConfirmButton: true,
        confirmButtonText: '前往設定',
        confirmButtonColor: '#f59e0b',
        background: '#1e293b',
        color: '#e2e8f0',
        timer: 10000, // Show for 10 seconds or until clicked
        timerProgressBar: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/settings']);
        }
      });
    }
  }
}
