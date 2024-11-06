import { Injectable } from '@nestjs/common';
import {
  ThermalPrinter,
  PrinterTypes,
  CharacterSet,
} from 'node-thermal-printer';
import * as os from 'os';
import * as usb from 'usb';
import { Order } from 'src/orders/order.entity';

@Injectable()
export class PrinterService {
  private printer: ThermalPrinter;

  constructor() {
    this.initializePrinter();
  }

  private async initializePrinter() {
    try {
      const platform = os.platform();
      const printerName = 'PRINTER POS-80';
      const printerConfig = {
        type: PrinterTypes.EPSON,
        characterSet: CharacterSet.PC852_LATIN2,
        removeSpecialCharacters: false,
        options: {
          timeout: 5000,
        },
        width: 80,
        interface: `printer:${printerName}}`,
        //interface: platform === 'win32' ? 'usb://0483:5743' : '/dev/usb/lp0',
      };

      console.log(
        `Inicializando impresora en ${platform} con configuración:`,
        printerConfig,
      );

      this.printer = new ThermalPrinter(printerConfig);

      const isConnected = await this.printer.isPrinterConnected();
      console.log(
        'Estado de la impresora:',
        isConnected ? 'Conectada' : 'No conectada',
      );

      return isConnected;
    } catch (error) {
      console.error('Error al inicializar la impresora:', error);
      throw error;
    }
  }

  private async listUsbDevices() {
    try {
      const devices = usb.getDeviceList();
      console.log('\n=== Dispositivos USB disponibles ===');
      devices.forEach((device) => {
        console.log({
          vendorId: device.deviceDescriptor.idVendor
            .toString(16)
            .padStart(4, '0'),
          productId: device.deviceDescriptor.idProduct
            .toString(16)
            .padStart(4, '0'),
          deviceAddress: device.deviceAddress,
          busNumber: device.busNumber,
          path: `usb://${device.deviceDescriptor.idVendor.toString(16).padStart(4, '0')}:${device.deviceDescriptor.idProduct.toString(16).padStart(4, '0')}`,
        });
      });
      console.log('===================================\n');
    } catch (error) {
      console.error('Error al listar dispositivos USB:', error);
    }
  }

  async printTicket(order: Order): Promise<void> {
    try {
      await this.listUsbDevices();

      if (!this.printer) {
        throw new Error('Impresora no inicializada');
      }

      const isConnected = await this.printer.isPrinterConnected();
      if (!isConnected) {
        throw new Error('Impresora no conectada');
      }

      // Configurar el formato
      this.printer.alignCenter();
      this.printer.bold(true);
      this.printer.setTextSize(1, 1);

      // Encabezado
      this.printer.println('TICKET DE ORDEN');
      this.printer.drawLine();

      // Detalles de la orden
      this.printer.println(`Orden #: ${order.id}`);
      this.printer.println(`Fecha: ${new Date().toLocaleString()}`);
      this.printer.drawLine();

      // Productos
      this.printer.alignLeft();
      this.printer.bold(false);
      order.orderItems.forEach((item) => {
        this.printer.println(`${item.product.name}`);
        this.printer.println(`   $${item.price.toFixed(2)}`);
      });

      this.printer.drawLine();

      // Total
      this.printer.alignRight();
      this.printer.bold(true);
      this.printer.println(`Total: $${order.totalCost.toFixed(2)}`);

      // Cortar papel
      this.printer.cut();

      // Ejecutar la impresión
      await this.printer.execute();

      console.log('Ticket impreso correctamente');
    } catch (error) {
      console.error('Error al imprimir ticket:', error);
      throw error;
    }
  }
}
