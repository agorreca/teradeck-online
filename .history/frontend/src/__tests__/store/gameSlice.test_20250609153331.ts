import gameSlice, {
  setLoading,
  setError,
  setCurrentRoom,
  setCurrentPlayer,
  clearGame,
} from '../../store/gameSlice';

const { reducer } = gameSlice;

describe('gameSlice', () => {
  const initialState = {
    currentRoom: null,
    currentPlayer: null,
    loading: false,
    error: null,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const action = setLoading(true);
      const state = reducer(initialState, action);
      
      expect(state.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const previousState = { ...initialState, loading: true };
      const action = setLoading(false);
      const state = reducer(previousState, action);
      
      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Something went wrong';
      const action = setError(errorMessage);
      const state = reducer(initialState, action);
      
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error when null', () => {
      const previousState = { ...initialState, error: 'Previous error' };
      const action = setError(null);
      const state = reducer(previousState, action);
      
      expect(state.error).toBe(null);
    });
  });

  describe('setCurrentRoom', () => {
    it('should set current room', () => {
      const room = {
        code: 'TEST123',
        players: [],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting',
      };
      
      const action = setCurrentRoom(room);
      const state = reducer(initialState, action);
      
      expect(state.currentRoom).toEqual(room);
    });

    it('should update existing room', () => {
      const previousRoom = {
        code: 'TEST123',
        players: [{ id: 'player1', nickname: 'Player1' }],
        status: 'waiting',
      };
      
      const updatedRoom = {
        ...previousRoom,
        players: [
          { id: 'player1', nickname: 'Player1' },
          { id: 'player2', nickname: 'Player2' },
        ],
      };
      
      const previousState = { ...initialState, currentRoom: previousRoom };
      const action = setCurrentRoom(updatedRoom);
      const state = reducer(previousState, action);
      
      expect(state.currentRoom.players).toHaveLength(2);
      expect(state.currentRoom.players[1].nickname).toBe('Player2');
    });
  });

  describe('setCurrentPlayer', () => {
    it('should set current player', () => {
      const player = {
        id: 'player1',
        nickname: 'TestPlayer',
        isHost: true,
        hand: [],
        modules: [],
      };
      
      const action = setCurrentPlayer(player);
      const state = reducer(initialState, action);
      
      expect(state.currentPlayer).toEqual(player);
    });

    it('should update existing player', () => {
      const previousPlayer = {
        id: 'player1',
        nickname: 'TestPlayer',
        isHost: true,
        hand: [{ id: 'card1' }],
        modules: [],
      };
      
      const updatedPlayer = {
        ...previousPlayer,
        hand: [{ id: 'card1' }, { id: 'card2' }],
      };
      
      const previousState = { ...initialState, currentPlayer: previousPlayer };
      const action = setCurrentPlayer(updatedPlayer);
      const state = reducer(previousState, action);
      
      expect(state.currentPlayer.hand).toHaveLength(2);
    });
  });

  describe('clearGame', () => {
    it('should clear all game data', () => {
      const gameInProgress = {
        currentRoom: {
          code: 'TEST123',
          players: [{ id: 'player1' }],
          status: 'playing',
        },
        currentPlayer: {
          id: 'player1',
          nickname: 'TestPlayer',
          hand: [{ id: 'card1' }],
        },
        loading: true,
        error: 'Some error',
      };
      
      const action = clearGame();
      const state = reducer(gameInProgress, action);
      
      expect(state).toEqual(initialState);
    });

    it('should work on already cleared state', () => {
      const action = clearGame();
      const state = reducer(initialState, action);
      
      expect(state).toEqual(initialState);
    });
  });

  describe('complex state updates', () => {
    it('should handle multiple actions in sequence', () => {
      let state = reducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
      
      const room = { code: 'TEST123', players: [] };
      state = reducer(state, setCurrentRoom(room));
      expect(state.currentRoom).toEqual(room);
      expect(state.loading).toBe(true);
      
      const player = { id: 'player1', nickname: 'TestPlayer' };
      state = reducer(state, setCurrentPlayer(player));
      expect(state.currentPlayer).toEqual(player);
      expect(state.currentRoom).toEqual(room);
      expect(state.loading).toBe(true);
      
      state = reducer(state, setLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentPlayer).toEqual(player);
      expect(state.currentRoom).toEqual(room);
    });

    it('should handle error state while preserving other data', () => {
      const room = { code: 'TEST123', players: [] };
      const player = { id: 'player1', nickname: 'TestPlayer' };
      
      let state = reducer(initialState, setCurrentRoom(room));
      state = reducer(state, setCurrentPlayer(player));
      state = reducer(state, setError('Connection failed'));
      
      expect(state.error).toBe('Connection failed');
      expect(state.currentRoom).toEqual(room);
      expect(state.currentPlayer).toEqual(player);
    });
  });

  describe('immutability', () => {
    it('should not mutate original state', () => {
      const originalState = { ...initialState };
      const room = { code: 'TEST123', players: [] };
      
      reducer(initialState, setCurrentRoom(room));
      
      expect(initialState).toEqual(originalState);
    });

    it('should create new state objects', () => {
      const room = { code: 'TEST123', players: [] };
      const action = setCurrentRoom(room);
      const newState = reducer(initialState, action);
      
      expect(newState).not.toBe(initialState);
      expect(newState.currentRoom).toBe(room);
    });
  });

  describe('action creators', () => {
    it('should create setLoading action', () => {
      const action = setLoading(true);
      
      expect(action).toEqual({
        type: 'game/setLoading',
        payload: true,
      });
    });

    it('should create setError action', () => {
      const action = setError('Test error');
      
      expect(action).toEqual({
        type: 'game/setError',
        payload: 'Test error',
      });
    });

    it('should create setCurrentRoom action', () => {
      const room = { code: 'TEST123' };
      const action = setCurrentRoom(room);
      
      expect(action).toEqual({
        type: 'game/setCurrentRoom',
        payload: room,
      });
    });

    it('should create setCurrentPlayer action', () => {
      const player = { id: 'player1' };
      const action = setCurrentPlayer(player);
      
      expect(action).toEqual({
        type: 'game/setCurrentPlayer',
        payload: player,
      });
    });

    it('should create clearGame action', () => {
      const action = clearGame();
      
      expect(action).toEqual({
        type: 'game/clearGame',
      });
    });
  });
}); 