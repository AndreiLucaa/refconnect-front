import React from 'react';
import { ClipboardList } from 'lucide-react';

export default function Delegations() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Delegări</h1>
                <p className="text-sm text-muted-foreground">Vizualizează delegările tale viitoare și trecute.</p>
            </div>

            <div className="grid place-items-center p-12 border-2 border-dashed rounded-lg border-muted">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <ClipboardList className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">Nu ai delegări momentan</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Când vei fi delegat la un meci, acesta va apărea aici împreună cu detaliile necesare.
                    </p>
                </div>
            </div>
        </div>
    );
}
