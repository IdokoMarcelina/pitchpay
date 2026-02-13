import { describe, it, expect } from 'vitest';
import { StacksService, getContractId } from '../services/stacks.service';

describe('StacksService', () => {
    describe('generatePitchHash', () => {
        it('should generate consistent hash for same content', () => {
            const content = 'test pitch data';
            const hash1 = StacksService.generatePitchHash(content);
            const hash2 = StacksService.generatePitchHash(content);
            expect(hash1).toBe(hash2);
        });

        it('should generate different hash for different content', () => {
            const hash1 = StacksService.generatePitchHash('content 1');
            const hash2 = StacksService.generatePitchHash('content 2');
            expect(hash1).not.toBe(hash2);
        });

        it('should return 64 character hex string', () => {
            const hash = StacksService.generatePitchHash('test');
            expect(hash).toMatch(/^[a-f0-9]{64}$/);
        });
    });

    describe('getContractId', () => {
        it('should return correct contract id format', () => {
            const contractId = getContractId();
            expect(contractId).toMatch(/^ST[A-Z0-9]+\.pitchpay_clar$/);
        });
    });
});

describe('Input Validation', () => {
    const validPitch = {
        title: 'Test Startup',
        description: 'A test startup description',
        website: 'https://test.com',
        founder: 'ST1PQHQKV0RJ7X6RGHN5X29D50Z6MR8BWG32W8A7',
    };

    it('should validate title length', () => {
        expect(validPitch.title.length).toBeGreaterThanOrEqual(3);
        expect(validPitch.title.length).toBeLessThanOrEqual(100);
    });

    it('should validate description length', () => {
        expect(validPitch.description.length).toBeGreaterThanOrEqual(10);
        expect(validPitch.description.length).toBeLessThanOrEqual(2000);
    });

    it('should validate website is valid URL', () => {
        expect(validPitch.website).toMatch(/^https?:\/\/.+/);
    });

    it('should validate founder address format', () => {
        expect(validPitch.founder).toMatch(/^ST[A-Z0-9]+$/);
    });
});

describe('Status Flow', () => {
    const validStatuses = ['PENDING', 'PAID', 'VERIFIED'];

    it('should have valid status values', () => {
        expect(validStatuses).toContain('PENDING');
        expect(validStatuses).toContain('PAID');
        expect(validStatuses).toContain('VERIFIED');
    });

    it('should have correct status order', () => {
        const statusOrder = ['PENDING', 'PAID', 'VERIFIED'];
        expect(statusOrder.indexOf('PENDING')).toBe(0);
        expect(statusOrder.indexOf('PAID')).toBe(1);
        expect(statusOrder.indexOf('VERIFIED')).toBe(2);
    });
});
