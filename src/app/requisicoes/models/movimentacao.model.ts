import { Requisicao } from "./requisicao.model"

export class Movimentacao{
  requisicaoId: string;
  requisicao?: Requisicao;
  dataAtualizacao: Date | any;
  nMovimentacao: number;
  status: string
}
