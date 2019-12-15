import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../core/services/database/database.service';
import { Router } from '@angular/router';
import { SystemService } from '../core/services/system.service';
import { SessionManager } from '../core/services/session/session-manager.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public currentView: number;
  public entryUser: string;

  public readonly VIEWS = {
    billEntry: 0,
    adminReports: 1
  };

  constructor(private databaseService: DatabaseService,
    private sysService: SystemService,
    private sessionManager: SessionManager,
    private router: Router) { }

  async ngOnInit() {
    this.currentView = this.VIEWS.billEntry;
    this.entryUser = this.sessionManager.entryUser;
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

  changeView(newView: number) {
    if (this.currentView !== newView) {
      this.currentView = newView;
    }
  }
}
