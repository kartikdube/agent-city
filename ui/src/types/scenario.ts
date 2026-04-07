export interface ScenarioMetadata {
  id: string;
  title: string;
  description: string;
  behavior_summary: string;
  governance_style: string;
  tags: string[];
}

export interface AgentTraits {
  [key: string]: number;
}

export interface Agent {
  id: string;
  role: string;
  body?: string;
  traits: AgentTraits;
  memory?: string[];
  employees?: string[];
}

export interface GovernmentStructure {
  president: string;
  bodies: string[];
  agents: {
    [key: string]: Agent | any;
  };
}

export interface District {
  housing_stock?: number;
  occupancy?: number;
  avg_price?: number;
  complaints?: string;
  businesses?: number;
  jobs?: number;
  traffic_index?: number;
  revenue?: number;
  factories?: number;
  pollution_index?: number;
  tax_revenue?: number;
}

export interface CityState {
  name: string;
  population: number;
  districts: {
    [key: string]: District;
  };
  budget: {
    revenue: number;
    expenses: number;
    surplus: number;
  };
  infrastructure: {
    [key: string]: any;
  };
  metrics: {
    [key: string]: number;
  };
  issues: string[];
}

export interface PipelineMessage {
  agent_id: string;
  name: string;
  role: string;
  content: string;
}

export interface PipelineBox {
  id: string;
  title: string;
  duration: string;
  transcript: PipelineMessage[];
  recommendation: string;
  summary: string;
  status: 'approved' | 'rejected' | 'neutral';
  stats?: {
    traffic: string;
    approval: string;
    budget: string;
    housing: string;
  };
}

export interface SimulationLog {
  boxes: PipelineBox[];
}

export interface ScenarioData {
  metadata: ScenarioMetadata;
  initial_city_state: CityState;
  government_structure: GovernmentStructure;
  simulation_log?: SimulationLog;
}
