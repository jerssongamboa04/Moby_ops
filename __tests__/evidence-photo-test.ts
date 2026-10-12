import { prepareEvidencePhoto } from '../src/features/public-order/lib/evidence-photo';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({ ImageManipulator: { manipulate: jest.fn() }, SaveFormat: { WEBP: 'webp' } }));
const resize = jest.fn(); const saveAsync = jest.fn(); const release = jest.fn(); const remove = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(File).mockImplementation(() => ({ size: 500, exists: true, delete: remove }) as unknown as File);
  saveAsync.mockResolvedValue({ uri: 'file:///converted.webp' });
  jest.mocked(ImageManipulator.manipulate).mockReturnValue({ resize, release, renderAsync: async () => ({ saveAsync, release }) } as unknown as ReturnType<typeof ImageManipulator.manipulate>);
});
test('resizes preserving aspect ratio, encodes WebP and removes the camera original', async () => {
  const photo = await prepareEvidencePhoto({ uri: 'file:///original.jpg', width: 4000, height: 3000 });
  expect(resize).toHaveBeenCalledWith({ width: 1600 });
  expect(saveAsync).toHaveBeenCalledWith({ format: SaveFormat.WEBP, compress: 0.8 });
  expect(photo).toEqual({ uri: 'file:///converted.webp', size: 500, capturedAt: expect.any(String) });
  expect(remove).toHaveBeenCalledTimes(1);
});
test('rejects oversized output and cleans both files', async () => {
  jest.mocked(File).mockImplementation(() => ({ size: 5242881, exists: true, delete: remove }) as unknown as File);
  await expect(prepareEvidencePhoto({ uri: 'file:///original.jpg', width: 1000, height: 800 })).rejects.toThrow('Photo size invalid');
  expect(resize).not.toHaveBeenCalled();
  expect(remove).toHaveBeenCalledTimes(2);
});
