export interface AiModel {
  id: string;
  name: string;
  created: string;
  pricing: { prompt: number; completion: number };
  context_length: number;
  architecture: { tokenizer: string; input_modalities: string[] };
  description: string;
}
