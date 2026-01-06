// modal.component.ts
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() contentTemplate?: TemplateRef<any>;
  @Input() showFooter: boolean = true;
  @Input() context: any = {};
  
  @Output() accept = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  safeTitle: SafeHtml = '';
  constructor(private sanitizer: DomSanitizer) {}
  onAccept() {
    this.accept.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.safeTitle = this.sanitizer.bypassSecurityTrustHtml(this.title);
  }
}