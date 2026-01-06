import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from '../loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {
  @Input() fullscreen: boolean = true; // modo overlay global
  isLoading = false;

  private sub: Subscription = new Subscription();

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.sub = this.loaderService.loaderState$.subscribe(state => {
      this.isLoading = state;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}