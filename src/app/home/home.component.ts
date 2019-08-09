import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../core/services/database/database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private databaseService: DatabaseService, private router: Router) { }

  async ngOnInit() {
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
