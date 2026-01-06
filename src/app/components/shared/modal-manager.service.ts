import { Injectable, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './modal/modal.component';


@Injectable({ providedIn: 'root' })
export class ModalManagerService {
  constructor(private modalService: NgbModal) {}

  openModal(options: {
    title: string;
    template: TemplateRef<any>;
    onAccept?: () => void;
    onCancel?: () => void;
    showFooter?: boolean;
    width?: string;
    height?: string;
  }): NgbModalRef {
    const modalRef = this.modalService.open(ModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: true,
      windowClass: this.generateWindowClass(options.width, options.height),
    });

    modalRef.componentInstance.title = options.title;
    modalRef.componentInstance.contentTemplate = options.template;
    modalRef.componentInstance.showFooter = options.showFooter ?? true;

    if (modalRef.componentInstance.showFooter) {
      modalRef.componentInstance.accept.subscribe(() => {
        options.onAccept?.();
        modalRef.close();
      });
      modalRef.componentInstance.cancel.subscribe(() => {
        options.onCancel?.();
        modalRef.dismiss();
      });
    } else {
      modalRef.componentInstance.context = {
        aceptar: () => {
          options.onAccept?.();
          modalRef.close();
        },
        cancelar: () => {
          options.onCancel?.();
          modalRef.dismiss();
        },
      };
      modalRef.componentInstance.cancel.subscribe(() => {
        options.onCancel?.();
        modalRef.dismiss();
      });
    }
    return modalRef;
  }

  private generateWindowClass(width?: string, height?: string): string {
    const widthClass = width ? `modal-width-${this.sanitize(width)}` : '';
    const heightClass = height ? `modal-height-${this.sanitize(height)}` : '';
    return `${widthClass} ${heightClass}`.trim();
  }

  private sanitize(value: string): string {
    // Elimina caracteres no válidos para nombres de clase (como %, px, etc.)
    return value.replace(/[^a-zA-Z0-9]/g, '-');
  }

    closeModal() {
    this.modalService.dismissAll();
  }
  
}