import { expect, test, describe } from 'vitest';
import { canTransition, STATE_TO_ROUTE, ROUTE_ALLOWED_STATES } from '../flow';

describe('Alarm Flow State Machine', () => {
    describe('canTransition', () => {
        test('allows valid transitions', () => {
            // 正常系フロー
            expect(canTransition('idle', 'waiting')).toBe(true);
            expect(canTransition('waiting', 'alarming')).toBe(true);
            expect(canTransition('alarming', 'coding')).toBe(true);
            expect(canTransition('coding', 'reviewing')).toBe(true);
            expect(canTransition('reviewing', 'cleared')).toBe(true);
            expect(canTransition('cleared', 'idle')).toBe(true);

            // 合否判定フロー
            expect(canTransition('reviewing', 'alarming')).toBe(true); // 不合格で戻る

            // ペナルティ・監視フロー
            expect(canTransition('coding', 'monitoring')).toBe(true);
            expect(canTransition('monitoring', 'penalty')).toBe(true);
            expect(canTransition('penalty', 'monitoring')).toBe(true);

            // 強制終了フロー
            expect(canTransition('alarming', 'force_stopped')).toBe(true);
            expect(canTransition('coding', 'force_stopped')).toBe(true);
            expect(canTransition('force_stopped', 'idle')).toBe(true);
        });

        test('denies invalid transitions', () => {
            expect(canTransition('idle', 'coding')).toBe(false);
            expect(canTransition('alarming', 'cleared')).toBe(false);
            expect(canTransition('cleared', 'coding')).toBe(false);
            expect(canTransition('reviewing', 'idle')).toBe(false);
        });
    });

    describe('Routing configs', () => {
        test('STATE_TO_ROUTE maps reviewing to /challenge', () => {
            expect(STATE_TO_ROUTE['reviewing']).toBe('/challenge');
            expect(STATE_TO_ROUTE['coding']).toBe('/challenge');
        });

        test('ROUTE_ALLOWED_STATES configuration covers standard workflows', () => {
            expect(ROUTE_ALLOWED_STATES['/challenge']).toContain('reviewing');
            expect(ROUTE_ALLOWED_STATES['/challenge']).toContain('coding');
            expect(ROUTE_ALLOWED_STATES['/']).toContain('cleared');
        });
    });
});
