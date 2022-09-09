import { Departamento } from "src/app/departamentos/models/departamento.model";
import { Equipamento } from "src/app/equipamentos/models/equipamento.model";
import { Funcionario } from "src/app/funcionarios/models/funcionario.model";

export class Requisicao{
  id: string;
  descricao: string;
  dataAbertura: Date | any;
  
  departamentoId: string;
  departamento?: Departamento;
  funcionarioId: string;
  funcionario?: Funcionario;
  equipamentoId: string;
  equipamento?: Equipamento;
}
