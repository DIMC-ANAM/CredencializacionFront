export {};

declare global {
    interface Window {
        WacomSTU: any;
        wgssSigCaptX: any;
    }

    interface Navigator {
        hid: {
            requestDevice(options: { filters: Array<{ vendorId?: number, productId?: number, usagePage?: number, usage?: number }> }): Promise<HIDDevice[]>;
            getDevices(): Promise<HIDDevice[]>;
        };
    }

    interface HIDDevice {
        opened: boolean;
        vendorId: number;
        productId: number;
        open(): Promise<void>;
        close(): Promise<void>;
        sendFeatureReport(reportId: number, data: BufferSource): Promise<void>;
        receiveFeatureReport(reportId: number): Promise<DataView>;
        addEventListener(type: string, listener: (event: any) => void): void;
        start?: () => void;
    }
}
