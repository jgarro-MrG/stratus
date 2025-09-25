export interface IElectronAPI {
    openFile: () => Promise<string | undefined>,
    saveFile: () => Promise<string | undefined>,
    readFile: (filePath: string) => Promise<string>,
    writeFile: (filePath: string, content: string) => Promise<void>,
    getStoreValue: <T>(key: string) => Promise<T | undefined>,
    setStoreValue: (key: string, value: any) => Promise<void>,
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}
