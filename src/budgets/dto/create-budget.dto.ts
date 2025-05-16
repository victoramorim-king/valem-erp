import { IsString, IsArray, IsNumber } from 'class-validator';

class BudgetItemDto {
  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateBudgetDto {
  @IsString()
  clientName: string;

  @IsNumber()
  total: number;

  @IsArray()
  items: BudgetItemDto[];
}

