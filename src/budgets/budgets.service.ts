import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { jsPDF } from 'jspdf';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        clientName: createBudgetDto.clientName,
        total: createBudgetDto.total,
        items: {
          create: createBudgetDto.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
  }

  async generatePdf(budgetId: number): Promise<Buffer> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
      include: { items: true },
    });

    if (!budget) throw new Error('Budget not found');

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.text(`Orçamento para: ${budget.clientName}`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Total: R$ ${budget.total.toFixed(2)}`, doc.internal.pageSize.width - 20, 30, { align: 'right' });

    // Configuração da tabela
    const startY = 40;
    const lineHeight = 10;
    const margin = 20;
    const col1Width = 80;  // Descrição
    const col2Width = 30;  // Quantidade
    const col3Width = 30;  // Preço Unit
    const col4Width = 40;  // Total

    // Cabeçalho da tabela
    doc.setFontSize(12);
    doc.text('Descrição', margin, startY);
    doc.text('Qtd', margin + col1Width, startY);
    doc.text('Preço Unit.', margin + col1Width + col2Width, startY);
    doc.text('Total', margin + col1Width + col2Width + col3Width, startY);

    // Linha separadora
    doc.line(margin, startY + 2, margin + col1Width + col2Width + col3Width + col4Width, startY + 2);

    // Itens
    let currentY = startY + lineHeight;
    budget.items.forEach((item) => {
      doc.text(item.description, margin, currentY);
      doc.text(item.quantity.toString(), margin + col1Width, currentY);
      doc.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + col1Width + col2Width, currentY);
      doc.text(`R$ ${(item.quantity * item.unitPrice).toFixed(2)}`, margin + col1Width + col2Width + col3Width, currentY);
      currentY += lineHeight;
    });

    return Buffer.from(doc.output('arraybuffer'));
  }
}

