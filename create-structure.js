const fs = require('fs');
const path = require('path');

// The full folder structure as a nested object
const structure = {
  'public': {
    'favicon.svg': null
  },
  'src': {
    'main.jsx': null,
    'App.jsx': null,
    'components': {
      'ui': {
        'Sidebar.jsx': null,
        'ControlPanel.jsx': null,
        'InfoDrawer.jsx': null,
        'TimingDiagram.jsx': null,
        'StateDiagram.jsx': null,
        'VerilogPanel.jsx': null,
        'PhaseIndicator.jsx': null
      },
      'canvas': {
        'GateCanvas.jsx': null,
        'FlipFlopCanvas.jsx': null,
        'HazardCanvas.jsx': null,
        'MemoryGrid.jsx': null,
        'PLAGrid.jsx': null
      },
      'gates': {
        'AndGate.js': null,
        'OrGate.js': null,
        'NotGate.js': null,
        'NandGate.js': null,
        'NorGate.js': null,
        'XorGate.js': null,
        'XnorGate.js': null,
        'GatePin.js': null
      },
      'widgets': {
        'KMapGrid.jsx': null,
        'NumberVisualizer.jsx': null,
        'HammingVisualizer.jsx': null,
        'SevenSegDisplay.jsx': null
      }
    },
    'engine': {
      'GraphEvaluator.js': null,
      'EventSimulator.js': null,
      'FlipFlopModels.js': null,
      'VerilogEmitter.js': null,
      'HammingEngine.js': null
    },
    'store': {
      'lessonStore.js': null,
      'canvasStore.js': null,
      'signalStore.js': null,
      'timingStore.js': null
    },
    'lessons': {
      'unit1': {
        'index.js': null,
        '01-and-gate.js': null,
        '02-or-gate.js': null,
        '03-not-gate.js': null,
        '04-nand-nor.js': null,
        '05-xor-xnor.js': null,
        '06-boolean-laws.js': null,
        '07-sop-pos.js': null,
        '08-kmap-2var.js': null,
        '09-kmap-3var.js': null,
        '10-kmap-4var.js': null
      },
      'unit2': {
        'index.js': null,
        '01-half-adder.js': null,
        '02-full-adder.js': null,
        '03-ripple-carry-adder.js': null,
        '04-subtractor.js': null,
        '05-encoder.js': null,
        '06-decoder.js': null,
        '07-mux.js': null,
        '08-demux.js': null,
        '09-comparator.js': null
      },
      'unit3': {
        'index.js': null,
        '01-sr-latch.js': null,
        '02-sr-flipflop.js': null,
        '03-jk-flipflop.js': null,
        '04-d-flipflop.js': null,
        '05-t-flipflop.js': null,
        '06-ripple-counter.js': null,
        '07-mod-n-counter.js': null,
        '08-ring-counter.js': null,
        '09-johnson-counter.js': null
      },
      'unit4': {
        'index.js': null,
        '01-async-circuits-intro.js': null,
        '02-race-conditions.js': null,
        '03-static-hazards.js': null,
        '04-dynamic-hazards.js': null,
        '05-hazard-elimination.js': null,
        '06-delay-model.js': null
      },
      'unit5': {
        'index.js': null,
        '01-sram.js': null,
        '02-dram.js': null,
        '03-rom.js': null,
        '04-eprom-flash.js': null,
        '05-pla.js': null,
        '06-pal.js': null,
        '07-hamming-code.js': null
      }
    }
  },
  'index.html': null,
  'vite.config.js': null,
  'package.json': null,
  'README.md': null
};

// Recursive function to create directories and files
function createStructure(basePath, node) {
  for (const [key, value] of Object.entries(node)) {
    const fullPath = path.join(basePath, key);
    
    if (value === null) {
      // It's a file — create an empty file
      fs.writeFileSync(fullPath, '', 'utf8');
      console.log(`📄 Created file: ${fullPath}`);
    } else {
      // It's a directory — create it and recurse
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${fullPath}`);
      createStructure(fullPath, value);
    }
  }
}

// Start from current directory
const rootDir = process.cwd();
console.log(`🚀 Creating GateLab project structure in: ${rootDir}`);
createStructure(rootDir, structure);
console.log('✅ Structure creation complete!');