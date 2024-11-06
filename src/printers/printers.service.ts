import { Injectable } from '@nestjs/common';
import * as escpos from 'escpos';
import * as USB from 'escpos-usb';
import { Order } from '../orders/order.entity';
import { format } from 'date-fns';

// Registrar el adaptador USB
escpos.USB = USB;

@Injectable()
export class PrinterService {
  private device: any;
  private printer: any;

  constructor() {
    try {
      // Obtener el dispositivo USB de la impresora
      // Nota: Deberás reemplazar los IDs con los de tu impresora
      this.device = new escpos.USB(0x125f, 0xc08a); // Ejemplo de VID y PID
      this.printer = new escpos.Printer(this.device);
    } catch (error) {
      console.error('Error al inicializar la impresora:', error);
    }
  }

  private removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  async printTicket(order: Order): Promise<void> {
    if (!this.device || !this.printer) {
      console.error('Impresora no inicializada');
      return;
    }

    try {
      this.device.open(async (error) => {
        if (error) {
          console.error('Error al abrir la impresora:', error);
          return;
        }

        // Configurar el estilo inicial
        this.printer.font('a').align('ct').style('b').size(3, 3);

        // Imprimir número de orden
        this.printer.text(`Orden #${order.id}\n\n`);

        // Imprimir detalles según el tipo de orden
        this.printer.size(2, 2);
        switch (order.orderType) {
          case 'delivery':
            this.printer
              .text(`Telefono: ${order.phoneNumber}\n`)
              .text(
                `Direccion: ${this.removeAccents(order.deliveryAddress)}\n`,
              );
            break;
          case 'pickup':
            this.printer
              .text(`Nombre: ${this.removeAccents(order.customerName)}\n`)
              .text(`Telefono: ${order.phoneNumber}\n`);
            break;
        }

        // Imprimir comentarios si existen
        if (order.comments) {
          this.printer
            .text('Comentarios: ')
            .text(this.removeAccents(order.comments) + '\n');
        }

        // Fecha y hora
        this.printer
          .size(1, 1)
          .text(`Fecha: ${format(order.creationDate, 'dd/MM/yyyy HH:mm')}\n`);

        if (order.scheduledDeliveryTime) {
          this.printer.text(
            `Hora programada: ${format(order.scheduledDeliveryTime, 'HH:mm')}\n`,
          );
        }

        this.printer.text('--------------------------------\n');

        // Imprimir items
        for (const item of order.orderItems) {
          const productName = this.removeAccents(
            item.productVariant?.name || item.product.name,
          );
          const price = `$${item.price}`;

          this.printer
            .size(2, 2)
            .align('lt')
            .text(productName)
            .align('rt')
            .text(price + '\n');

          // Imprimir modificadores
          if (item.selectedModifiers?.length > 0) {
            const modifiers = item.selectedModifiers
              .map((m) => this.removeAccents(m.modifier.name))
              .join(', ');
            this.printer.size(1, 1).text(modifiers + '\n');
          }

          // Imprimir sabores de pizza
          if (item.selectedPizzaFlavors?.length > 0) {
            const flavors = item.selectedPizzaFlavors
              .map((f) => this.removeAccents(f.pizzaFlavor.name))
              .join('/');
            this.printer.text(flavors + '\n');
          }

          // Imprimir ingredientes
          if (item.selectedPizzaIngredients?.length > 0) {
            const ingredients = item.selectedPizzaIngredients
              .map(
                (i) =>
                  `${i.action === 'remove' ? 'Sin ' : ''}${this.removeAccents(
                    i.pizzaIngredient.name,
                  )}`,
              )
              .join(', ');
            this.printer.text(ingredients + '\n');
          }
        }

        // Total
        this.printer
          .text('--------------------------------\n')
          .size(2, 2)
          .align('ct')
          .text(`Total: $${order.totalCost}\n`);

        // Monto pagado y resto si existe
        if (order.amountPaid > 0) {
          this.printer
            .text(`Pagado: $${order.amountPaid}\n`)
            .text(`Resto: $${order.totalCost - order.amountPaid}\n`);
        }

        // Mensaje final
        this.printer
          .size(1, 1)
          .text('\n" Gracias por su preferencia "\n\n')
          .cut()
          .close();
      });
    } catch (error) {
      console.error('Error al imprimir:', error);
    }
  }
}
