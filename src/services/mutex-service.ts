import { Mutex } from "async-mutex";

export class CS571MutexService {

    private studentLocks: Record<string, Mutex> = {};

    public getLock(studentId: string): Mutex {
        if (!this.studentLocks[studentId]) {
            this.studentLocks[studentId] = new Mutex();
        }
        return this.studentLocks[studentId];
    }
}