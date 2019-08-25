import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../core/services/database/database.service';
import { Router } from '@angular/router';
import { SystemService } from '../core/services/system.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private databaseService: DatabaseService,
    private sysService: SystemService,
    private router: Router) { }

  async ngOnInit() {
  }

  logout() {
    this.router.navigate(['/login']);
  }

  logoutWindows() {
    this.sysService.logoutWindows();
  }

  shutdownWindows() {
    this.sysService.shutdownWindows();
  }

  rebootWindows() {
    this.sysService.rebootWindows();
  }
}
