import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
    if (!(window as any).global) {
        (window as any).global = window;
    }
}
