import { generateId } from '../utils/uuid';

describe('generateId', () => {
  it('should generate a valid UUID v4 format', () => {
    const id = generateId();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(id).toMatch(uuidRegex);
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(1000);
  });

  it('should have correct length', () => {
    const id = generateId();
    expect(id.length).toBe(36);
  });

  it('should have version 4 indicator', () => {
    const id = generateId();
    expect(id[14]).toBe('4');
  });

  it('should have correct variant bits', () => {
    const id = generateId();
    const variantChar = id[19];
    expect(['8', '9', 'a', 'b']).toContain(variantChar);
  });
});
