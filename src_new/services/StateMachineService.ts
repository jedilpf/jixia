export type StateTransition<TState extends string, TEvent extends string> = {
  from: TState | TState[];
  to: TState;
  event: TEvent;
  condition?: (context: unknown) => boolean;
  action?: (context: unknown) => void;
};

export interface StateMachineConfig<TState extends string, TEvent extends string> {
  initial: TState;
  states: TState[];
  events: TEvent[];
  transitions: StateTransition<TState, TEvent>[];
}

export interface StateMachineState<TState extends string> {
  current: TState;
  previous?: TState;
  context: unknown;
  history: Array<{ state: TState; timestamp: number }>;
}

export class StateMachineService<TState extends string, TEvent extends string> {
  private config: StateMachineConfig<TState, TEvent>;
  private state: StateMachineState<TState>;
  private observers: Set<(from: TState, to: TState, event: TEvent) => void> = new Set();

  constructor(config: StateMachineConfig<TState, TEvent>, initialContext?: unknown) {
    this.config = config;
    this.state = {
      current: config.initial,
      context: initialContext,
      history: [{ state: config.initial, timestamp: Date.now() }],
    };
  }

  getCurrentState(): TState {
    return this.state.current;
  }

  getPreviousState(): TState | undefined {
    return this.state.previous;
  }

  getContext(): unknown {
    return this.state.context;
  }

  setContext(context: unknown): void {
    this.state.context = context;
  }

  canTransition(event: TEvent): boolean {
    return this.config.transitions.some(
      (t) =>
        t.event === event &&
        (Array.isArray(t.from) ? t.from.includes(this.state.current) : t.from === this.state.current) &&
        (!t.condition || t.condition(this.state.context))
    );
  }

  transition(event: TEvent): boolean {
    const transition = this.config.transitions.find(
      (t) =>
        t.event === event &&
        (Array.isArray(t.from) ? t.from.includes(this.state.current) : t.from === this.state.current) &&
        (!t.condition || t.condition(this.state.context))
    );

    if (!transition) {
      return false;
    }

    const fromState = this.state.current;
    this.state.previous = fromState;
    this.state.current = transition.to;
    this.state.history.push({ state: transition.to, timestamp: Date.now() });

    if (transition.action) {
      transition.action(this.state.context);
    }

    this.notifyObservers(fromState, transition.to, event);
    return true;
  }

  getHistory(): Array<{ state: TState; timestamp: number }> {
    return [...this.state.history];
  }

  is(state: TState): boolean {
    return this.state.current === state;
  }

  isNot(state: TState): boolean {
    return this.state.current !== state;
  }

  subscribe(callback: (from: TState, to: TState, event: TEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(from: TState, to: TState, event: TEvent): void {
    this.observers.forEach((callback) => callback(from, to, event));
  }

  reset(): void {
    this.state.current = this.config.initial;
    this.state.previous = undefined;
    this.state.history = [{ state: this.config.initial, timestamp: Date.now() }];
  }
}

export const createStateMachine = <TState extends string, TEvent extends string>(
  config: StateMachineConfig<TState, TEvent>,
  initialContext?: unknown
) => new StateMachineService(config, initialContext);
