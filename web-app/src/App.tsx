import { useState } from 'react';
import { RecordingControls } from './components/RecordingControls';
import { VideoLibrary } from './components/VideoLibrary';

type Page = 'recorder' | 'library';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('recorder');

  return (
    <div>
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  🎬 Screen Docs
                </h1>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentPage('recorder')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === 'recorder'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  🎥 Record
                </button>
                <button
                  onClick={() => setCurrentPage('library')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === 'library'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  📚 Library
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                ✨ Zero-Install • No Extension
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'recorder' ? (
        <RecordingControls />
      ) : (
        <VideoLibrary />
      )}
    </div>
  );
}

export default App;
