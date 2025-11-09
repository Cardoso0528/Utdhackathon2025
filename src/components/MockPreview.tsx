import React from 'react';
import { mockAnalysisResult } from '../mocks/index.mock';

const MockPreview: React.FC = () => {
    return (
        <section className="p-4 border rounded mt-4 bg-white/80">
            <h2 className="text-xl font-semibold mb-2">Mock Data Preview</h2>
            <div style={{ maxHeight: 400, overflow: 'auto', background: '#0f172a', color: '#e6eef8', padding: 12 }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {JSON.stringify(mockAnalysisResult, null, 2)}
                </pre>
            </div>
        </section>
    );
};

export default MockPreview;
