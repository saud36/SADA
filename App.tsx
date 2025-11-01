
import React, { useState } from 'react';
import { WriterSection } from './components/WriterSection';
import { SpeakerSection } from './components/SpeakerSection';

const App: React.FC = () => {
  const [mainText, setMainText] = useState<string>('أهلاً بك في محرر النصوص الذكي. اكتب أو الصق نصك هنا للبدء.');

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
            محرر ومحول النص الصوتي
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            مدعوم بالذكاء الاصطناعي من Gemini
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WriterSection text={mainText} onTextChange={setMainText} />
          <SpeakerSection text={mainText} />
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>تم التطوير بواسطة فريق من الخبراء العالميين في الواجهات الأمامية والذكاء الاصطناعي.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
