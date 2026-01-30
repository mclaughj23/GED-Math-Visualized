import React, { useState, useEffect, useRef, useCallback } from 'react';

// 3Blue1Brown color palette
const COLORS = {
  background: '#1c1c1c',
  backgroundDark: '#0d0d0d',
  blue: '#58c4dd',
  blueLight: '#9cdceb',
  blueDark: '#1c758a',
  brown: '#cd853f',
  gold: '#ffd700',
  cream: '#fffdd0',
  green: '#83c167',
  red: '#fc6255',
  purple: '#9a72ac',
  text: '#ffffff',
  textMuted: '#888888',
  gridLine: '#333333',
};

// Animated number component
const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime;
    const startValue = displayValue;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + (value - startValue) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{Math.round(displayValue * 100) / 100}</span>;
};

// Coordinate plane visualization
const CoordinatePlane = ({ points = [], lines = [], highlightPoint = null, showGrid = true, xRange = [-5, 5], yRange = [-5, 5] }) => {
  const width = 400;
  const height = 400;
  const padding = 40;
  
  const xScale = (x) => padding + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (width - 2 * padding);
  const yScale = (y) => height - padding - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (height - 2 * padding);
  
  return (
    <svg width={width} height={height} style={{ background: COLORS.backgroundDark, borderRadius: 12 }}>
      {/* Grid */}
      {showGrid && Array.from({ length: xRange[1] - xRange[0] + 1 }, (_, i) => i + xRange[0]).map(x => (
        <line key={`gx${x}`} x1={xScale(x)} y1={padding} x2={xScale(x)} y2={height - padding} 
          stroke={x === 0 ? COLORS.textMuted : COLORS.gridLine} strokeWidth={x === 0 ? 2 : 1} />
      ))}
      {showGrid && Array.from({ length: yRange[1] - yRange[0] + 1 }, (_, i) => i + yRange[0]).map(y => (
        <line key={`gy${y}`} x1={padding} y1={yScale(y)} x2={width - padding} y2={yScale(y)} 
          stroke={y === 0 ? COLORS.textMuted : COLORS.gridLine} strokeWidth={y === 0 ? 2 : 1} />
      ))}
      
      {/* Axis labels */}
      <text x={width - padding + 15} y={yScale(0) + 5} fill={COLORS.text} fontSize={14} fontFamily="serif">x</text>
      <text x={xScale(0) + 10} y={padding - 10} fill={COLORS.text} fontSize={14} fontFamily="serif">y</text>
      
      {/* Lines */}
      {lines.map((line, i) => (
        <line key={`line${i}`} 
          x1={xScale(line.x1)} y1={yScale(line.y1)} 
          x2={xScale(line.x2)} y2={yScale(line.y2)}
          stroke={line.color || COLORS.blue} strokeWidth={3}
          style={{ animation: 'drawLine 1s ease-out forwards' }}
        />
      ))}
      
      {/* Points */}
      {points.map((point, i) => (
        <g key={`point${i}`} style={{ animation: `fadeIn 0.5s ease-out ${i * 0.2}s both` }}>
          <circle cx={xScale(point.x)} cy={yScale(point.y)} r={highlightPoint === i ? 12 : 8} 
            fill={point.color || COLORS.gold} opacity={0.3} />
          <circle cx={xScale(point.x)} cy={yScale(point.y)} r={highlightPoint === i ? 8 : 5} 
            fill={point.color || COLORS.gold} />
          {point.label && (
            <text x={xScale(point.x) + 12} y={yScale(point.y) - 12} fill={COLORS.text} fontSize={14} fontFamily="serif">
              ({point.x}, {point.y})
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

// Fraction visualization
const FractionVisual = ({ numerator, denominator, animate = true }) => {
  const [progress, setProgress] = useState(animate ? 0 : 1);
  
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setProgress(1), 100);
      return () => clearTimeout(timer);
    }
  }, [animate, numerator, denominator]);
  
  const width = 200;
  const height = 40;
  const partWidth = width / denominator;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={width + 4} height={height + 4} style={{ overflow: 'visible' }}>
        <rect x={0} y={0} width={width} height={height} fill="none" stroke={COLORS.textMuted} strokeWidth={2} rx={4} />
        {Array.from({ length: denominator }, (_, i) => (
          <g key={i}>
            <rect 
              x={i * partWidth + 2} 
              y={2} 
              width={partWidth - 4} 
              height={height - 4}
              fill={i < numerator ? COLORS.blue : 'transparent'}
              rx={2}
              style={{ 
                opacity: progress,
                transform: `scaleX(${progress})`,
                transformOrigin: 'left',
                transition: `all 0.5s ease-out ${i * 0.1}s`
              }}
            />
            {i > 0 && (
              <line x1={i * partWidth} y1={0} x2={i * partWidth} y2={height} stroke={COLORS.gridLine} strokeWidth={1} />
            )}
          </g>
        ))}
      </svg>
      <div style={{ 
        fontFamily: 'Georgia, serif', 
        fontSize: 24, 
        color: COLORS.blue,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <span>{numerator}</span>
        <div style={{ width: 30, height: 2, background: COLORS.text, margin: '2px 0' }} />
        <span>{denominator}</span>
      </div>
    </div>
  );
};

// Equation step-through component
const EquationSteps = ({ steps, currentStep }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 16,
      fontFamily: 'Georgia, serif',
      fontSize: 24
    }}>
      {steps.map((step, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: i <= currentStep ? 1 : 0.2,
          transform: `translateX(${i <= currentStep ? 0 : -20}px)`,
          transition: 'all 0.5s ease-out'
        }}>
          <div style={{ 
            color: i === currentStep ? COLORS.gold : COLORS.text,
            textShadow: i === currentStep ? `0 0 20px ${COLORS.gold}40` : 'none'
          }}>
            {step.equation}
          </div>
          {step.annotation && i <= currentStep && (
            <div style={{ 
              color: COLORS.blue, 
              fontSize: 14,
              opacity: i === currentStep ? 1 : 0.5,
              animation: i === currentStep ? 'fadeSlideIn 0.5s ease-out' : 'none'
            }}>
              ← {step.annotation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Progress ring
const ProgressRing = ({ progress, size = 60 }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={COLORS.gridLine} strokeWidth={strokeWidth} />
      <circle 
        cx={size/2} cy={size/2} r={radius} 
        fill="none" 
        stroke={COLORS.blue} 
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
      />
    </svg>
  );
};

// GED Topics data
const topics = [
  {
    id: 'numbers',
    title: 'Number Operations',
    icon: '∑',
    color: COLORS.blue,
    lessons: [
      {
        id: 'fractions',
        title: 'Understanding Fractions',
        content: 'fractions'
      },
      {
        id: 'decimals',
        title: 'Decimals & Percentages',
        content: 'decimals'
      },
      {
        id: 'integers',
        title: 'Working with Integers',
        content: 'integers'
      }
    ]
  },
  {
    id: 'algebra',
    title: 'Algebra Fundamentals',
    icon: 'x',
    color: COLORS.gold,
    lessons: [
      {
        id: 'solving',
        title: 'Solving Equations',
        content: 'equations'
      },
      {
        id: 'linear',
        title: 'Linear Equations',
        content: 'linear'
      },
      {
        id: 'inequalities',
        title: 'Inequalities',
        content: 'inequalities'
      }
    ]
  },
  {
    id: 'geometry',
    title: 'Geometry',
    icon: '△',
    color: COLORS.green,
    lessons: [
      {
        id: 'shapes',
        title: 'Shapes & Properties',
        content: 'shapes'
      },
      {
        id: 'area',
        title: 'Area & Perimeter',
        content: 'area'
      },
      {
        id: 'pythagorean',
        title: 'Pythagorean Theorem',
        content: 'pythagorean'
      }
    ]
  },
  {
    id: 'data',
    title: 'Data & Statistics',
    icon: '📊',
    color: COLORS.purple,
    lessons: [
      {
        id: 'mean',
        title: 'Mean, Median, Mode',
        content: 'statistics'
      },
      {
        id: 'probability',
        title: 'Basic Probability',
        content: 'probability'
      },
      {
        id: 'graphs',
        title: 'Reading Graphs',
        content: 'graphs'
      }
    ]
  }
];

// Lesson content components
const FractionsLesson = () => {
  const [step, setStep] = useState(0);
  const [num, setNum] = useState(3);
  const [denom, setDenom] = useState(4);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${COLORS.backgroundDark} 0%, ${COLORS.background} 100%)`,
        padding: 32,
        borderRadius: 16,
        border: `1px solid ${COLORS.gridLine}`
      }}>
        <h3 style={{ color: COLORS.blue, fontFamily: 'Georgia, serif', fontSize: 28, margin: '0 0 24px 0' }}>
          What is a Fraction?
        </h3>
        <p style={{ color: COLORS.cream, lineHeight: 1.8, fontSize: 18, fontFamily: 'Georgia, serif' }}>
          A fraction represents <span style={{ color: COLORS.gold }}>a part of a whole</span>. 
          The top number (numerator) tells us how many parts we have. 
          The bottom number (denominator) tells us how many equal parts the whole is divided into.
        </p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: 48,
        padding: 32,
        background: COLORS.backgroundDark,
        borderRadius: 16
      }}>
        <FractionVisual numerator={num} denominator={denom} key={`${num}-${denom}`} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: COLORS.textMuted, fontSize: 14, width: 100 }}>Numerator:</span>
            <input 
              type="range" 
              min="0" 
              max={denom} 
              value={num} 
              onChange={(e) => setNum(Number(e.target.value))}
              style={{ accentColor: COLORS.blue }}
            />
            <span style={{ color: COLORS.blue, fontSize: 20, width: 30 }}>{num}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: COLORS.textMuted, fontSize: 14, width: 100 }}>Denominator:</span>
            <input 
              type="range" 
              min="1" 
              max="12" 
              value={denom} 
              onChange={(e) => {
                const newDenom = Number(e.target.value);
                setDenom(newDenom);
                if (num > newDenom) setNum(newDenom);
              }}
              style={{ accentColor: COLORS.gold }}
            />
            <span style={{ color: COLORS.gold, fontSize: 20, width: 30 }}>{denom}</span>
          </div>
        </div>
      </div>
      
      <div style={{ color: COLORS.text, textAlign: 'center', fontSize: 18, fontFamily: 'Georgia, serif' }}>
        This shows <span style={{ color: COLORS.blue }}>{num}</span> out of <span style={{ color: COLORS.gold }}>{denom}</span> parts, 
        which equals <span style={{ color: COLORS.green }}>{Math.round((num/denom) * 100)}%</span> of the whole
      </div>
    </div>
  );
};

const EquationsLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { equation: '2x + 5 = 13', annotation: 'Our starting equation' },
    { equation: '2x + 5 - 5 = 13 - 5', annotation: 'Subtract 5 from both sides' },
    { equation: '2x = 8', annotation: 'Simplify' },
    { equation: '2x ÷ 2 = 8 ÷ 2', annotation: 'Divide both sides by 2' },
    { equation: 'x = 4', annotation: 'Solution!' }
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${COLORS.backgroundDark} 0%, ${COLORS.background} 100%)`,
        padding: 32,
        borderRadius: 16,
        border: `1px solid ${COLORS.gridLine}`
      }}>
        <h3 style={{ color: COLORS.gold, fontFamily: 'Georgia, serif', fontSize: 28, margin: '0 0 24px 0' }}>
          Solving Equations: The Balance Principle
        </h3>
        <p style={{ color: COLORS.cream, lineHeight: 1.8, fontSize: 18, fontFamily: 'Georgia, serif' }}>
          Think of an equation as a <span style={{ color: COLORS.blue }}>perfectly balanced scale</span>. 
          Whatever you do to one side, you must do to the other to keep it balanced. 
          Our goal is to <span style={{ color: COLORS.gold }}>isolate the variable</span> (get x alone).
        </p>
      </div>
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        padding: 48,
        background: COLORS.backgroundDark,
        borderRadius: 16
      }}>
        <EquationSteps steps={steps} currentStep={currentStep} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          style={{
            padding: '12px 24px',
            background: currentStep === 0 ? COLORS.gridLine : COLORS.blue,
            border: 'none',
            borderRadius: 8,
            color: COLORS.text,
            fontSize: 16,
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'Georgia, serif',
            transition: 'all 0.3s ease'
          }}
        >
          ← Previous Step
        </button>
        <button 
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          style={{
            padding: '12px 24px',
            background: currentStep === steps.length - 1 ? COLORS.gridLine : COLORS.gold,
            border: 'none',
            borderRadius: 8,
            color: COLORS.backgroundDark,
            fontSize: 16,
            cursor: currentStep === steps.length - 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'Georgia, serif',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
};

const LinearLesson = () => {
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);
  
  const points = [];
  const linePoints = { x1: -5, y1: slope * -5 + intercept, x2: 5, y2: slope * 5 + intercept };
  
  for (let x = -4; x <= 4; x += 2) {
    const y = slope * x + intercept;
    if (y >= -5 && y <= 5) {
      points.push({ x, y, color: COLORS.gold, label: true });
    }
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${COLORS.backgroundDark} 0%, ${COLORS.background} 100%)`,
        padding: 32,
        borderRadius: 16,
        border: `1px solid ${COLORS.gridLine}`
      }}>
        <h3 style={{ color: COLORS.gold, fontFamily: 'Georgia, serif', fontSize: 28, margin: '0 0 24px 0' }}>
          Linear Equations: y = mx + b
        </h3>
        <p style={{ color: COLORS.cream, lineHeight: 1.8, fontSize: 18, fontFamily: 'Georgia, serif' }}>
          Every linear equation graphs as a <span style={{ color: COLORS.blue }}>straight line</span>. 
          The <span style={{ color: COLORS.green }}>slope (m)</span> determines how steep the line is. 
          The <span style={{ color: COLORS.purple }}>y-intercept (b)</span> is where the line crosses the y-axis.
        </p>
      </div>
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 48,
        padding: 32,
        background: COLORS.backgroundDark,
        borderRadius: 16
      }}>
        <CoordinatePlane 
          points={points}
          lines={[{ ...linePoints, color: COLORS.blue }]}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ 
            fontFamily: 'Georgia, serif', 
            fontSize: 32, 
            color: COLORS.text,
            textAlign: 'center'
          }}>
            y = <span style={{ color: COLORS.green }}>{slope}</span>x + <span style={{ color: COLORS.purple }}>{intercept}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: COLORS.green, fontSize: 16, width: 120, fontFamily: 'Georgia, serif' }}>Slope (m):</span>
              <input 
                type="range" 
                min="-3" 
                max="3" 
                step="0.5"
                value={slope} 
                onChange={(e) => setSlope(Number(e.target.value))}
                style={{ accentColor: COLORS.green, width: 150 }}
              />
              <span style={{ color: COLORS.green, fontSize: 20, width: 40 }}>{slope}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: COLORS.purple, fontSize: 16, width: 120, fontFamily: 'Georgia, serif' }}>Intercept (b):</span>
              <input 
                type="range" 
                min="-4" 
                max="4" 
                value={intercept} 
                onChange={(e) => setIntercept(Number(e.target.value))}
                style={{ accentColor: COLORS.purple, width: 150 }}
              />
              <span style={{ color: COLORS.purple, fontSize: 20, width: 40 }}>{intercept}</span>
            </div>
          </div>
          
          <div style={{ 
            padding: 16, 
            background: COLORS.background, 
            borderRadius: 8,
            color: COLORS.textMuted,
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'Georgia, serif'
          }}>
            {slope > 0 ? '↗ Line rises from left to right' : slope < 0 ? '↘ Line falls from left to right' : '→ Line is horizontal'}
            <br />
            Crosses y-axis at y = {intercept}
          </div>
        </div>
      </div>
    </div>
  );
};

const PythagoreanLesson = () => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.sqrt(a*a + b*b);
  
  const scale = 30;
  const padding = 60;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${COLORS.backgroundDark} 0%, ${COLORS.background} 100%)`,
        padding: 32,
        borderRadius: 16,
        border: `1px solid ${COLORS.gridLine}`
      }}>
        <h3 style={{ color: COLORS.green, fontFamily: 'Georgia, serif', fontSize: 28, margin: '0 0 24px 0' }}>
          The Pythagorean Theorem: a² + b² = c²
        </h3>
        <p style={{ color: COLORS.cream, lineHeight: 1.8, fontSize: 18, fontFamily: 'Georgia, serif' }}>
          In a <span style={{ color: COLORS.blue }}>right triangle</span>, the square of the hypotenuse (the side opposite the right angle) 
          equals the sum of the squares of the other two sides. This is one of the most beautiful relationships in all of mathematics.
        </p>
      </div>
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 48,
        padding: 32,
        background: COLORS.backgroundDark,
        borderRadius: 16
      }}>
        <svg width={400} height={350} style={{ overflow: 'visible' }}>
          {/* Triangle */}
          <polygon 
            points={`${padding},${300 - padding} ${padding + a*scale},${300 - padding} ${padding},${300 - padding - b*scale}`}
            fill={`${COLORS.blue}20`}
            stroke={COLORS.blue}
            strokeWidth={3}
          />
          
          {/* Right angle marker */}
          <rect x={padding} y={300 - padding - 15} width={15} height={15} fill="none" stroke={COLORS.textMuted} strokeWidth={1} />
          
          {/* Side a */}
          <line x1={padding} y1={300 - padding + 20} x2={padding + a*scale} y2={300 - padding + 20} stroke={COLORS.red} strokeWidth={2} />
          <text x={padding + a*scale/2} y={300 - padding + 40} fill={COLORS.red} fontSize={18} textAnchor="middle" fontFamily="Georgia, serif">
            a = {a}
          </text>
          
          {/* Side b */}
          <line x1={padding - 20} y1={300 - padding} x2={padding - 20} y2={300 - padding - b*scale} stroke={COLORS.green} strokeWidth={2} />
          <text x={padding - 35} y={300 - padding - b*scale/2} fill={COLORS.green} fontSize={18} textAnchor="middle" fontFamily="Georgia, serif" transform={`rotate(-90, ${padding - 35}, ${300 - padding - b*scale/2})`}>
            b = {b}
          </text>
          
          {/* Hypotenuse c */}
          <text x={padding + a*scale/2 + 20} y={300 - padding - b*scale/2 - 10} fill={COLORS.gold} fontSize={18} fontFamily="Georgia, serif">
            c = {c.toFixed(2)}
          </text>
          
          {/* Squares visualization */}
          <g style={{ opacity: 0.3 }}>
            {/* Square on a */}
            <rect x={padding} y={300 - padding} width={a*scale} height={a*scale} fill={COLORS.red} stroke={COLORS.red} strokeWidth={1} />
            {/* Square on b */}
            <rect x={padding - b*scale} y={300 - padding - b*scale} width={b*scale} height={b*scale} fill={COLORS.green} stroke={COLORS.green} strokeWidth={1} />
          </g>
        </svg>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ 
            fontFamily: 'Georgia, serif', 
            fontSize: 24, 
            color: COLORS.text,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div><span style={{ color: COLORS.red }}>{a}²</span> + <span style={{ color: COLORS.green }}>{b}²</span> = <span style={{ color: COLORS.gold }}>c²</span></div>
            <div><span style={{ color: COLORS.red }}>{a*a}</span> + <span style={{ color: COLORS.green }}>{b*b}</span> = <span style={{ color: COLORS.gold }}>{a*a + b*b}</span></div>
            <div>c = √{a*a + b*b} = <span style={{ color: COLORS.gold }}>{c.toFixed(2)}</span></div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: COLORS.red, fontSize: 16, width: 80, fontFamily: 'Georgia, serif' }}>Side a:</span>
              <input 
                type="range" 
                min="1" 
                max="8" 
                value={a} 
                onChange={(e) => setA(Number(e.target.value))}
                style={{ accentColor: COLORS.red, width: 150 }}
              />
              <span style={{ color: COLORS.red, fontSize: 20, width: 30 }}>{a}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: COLORS.green, fontSize: 16, width: 80, fontFamily: 'Georgia, serif' }}>Side b:</span>
              <input 
                type="range" 
                min="1" 
                max="8" 
                value={b} 
                onChange={(e) => setB(Number(e.target.value))}
                style={{ accentColor: COLORS.green, width: 150 }}
              />
              <span style={{ color: COLORS.green, fontSize: 20, width: 30 }}>{b}</span>
            </div>
          </div>
          
          {a === 3 && b === 4 && (
            <div style={{ 
              padding: 12, 
              background: `${COLORS.gold}20`, 
              borderRadius: 8,
              color: COLORS.gold,
              fontSize: 14,
              fontFamily: 'Georgia, serif'
            }}>
              ✨ 3-4-5 is a famous "Pythagorean triple" — all whole numbers!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatisticsLesson = () => {
  const [data, setData] = useState([2, 4, 4, 4, 5, 5, 7, 9]);
  
  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const median = data.length % 2 === 0 
    ? (sorted[data.length/2 - 1] + sorted[data.length/2]) / 2 
    : sorted[Math.floor(data.length/2)];
  
  const modeMap = {};
  data.forEach(n => { modeMap[n] = (modeMap[n] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(modeMap));
  const mode = Object.entries(modeMap).filter(([k, v]) => v === maxFreq).map(([k]) => Number(k));
  
  const maxVal = Math.max(...data);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${COLORS.backgroundDark} 0%, ${COLORS.background} 100%)`,
        padding: 32,
        borderRadius: 16,
        border: `1px solid ${COLORS.gridLine}`
      }}>
        <h3 style={{ color: COLORS.purple, fontFamily: 'Georgia, serif', fontSize: 28, margin: '0 0 24px 0' }}>
          Measures of Center: Mean, Median, Mode
        </h3>
        <p style={{ color: COLORS.cream, lineHeight: 1.8, fontSize: 18, fontFamily: 'Georgia, serif' }}>
          These three measures help us understand the <span style={{ color: COLORS.gold }}>"center"</span> of a data set. 
          Each tells us something different about the typical value.
        </p>
      </div>
      
      <div style={{ 
        padding: 32,
        background: COLORS.backgroundDark,
        borderRadius: 16
      }}>
        <div style={{ marginBottom: 24, color: COLORS.textMuted, fontFamily: 'Georgia, serif' }}>
          Data set: [{data.join(', ')}]
        </div>
        
        {/* Bar chart visualization */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150, marginBottom: 32 }}>
          {data.map((value, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div 
                style={{ 
                  width: 40, 
                  height: (value / maxVal) * 120,
                  background: mode.includes(value) 
                    ? `linear-gradient(to top, ${COLORS.purple}, ${COLORS.blue})`
                    : COLORS.blue,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease-out',
                  boxShadow: mode.includes(value) ? `0 0 15px ${COLORS.purple}60` : 'none'
                }} 
              />
              <span style={{ color: COLORS.text, fontSize: 14 }}>{value}</span>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div style={{ 
            padding: 20, 
            background: COLORS.background, 
            borderRadius: 12,
            borderLeft: `4px solid ${COLORS.blue}`
          }}>
            <div style={{ color: COLORS.blue, fontSize: 14, marginBottom: 8, fontFamily: 'Georgia, serif' }}>MEAN (Average)</div>
            <div style={{ color: COLORS.text, fontSize: 28, fontFamily: 'Georgia, serif' }}>
              <AnimatedNumber value={mean} />
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 8 }}>
              Sum all values, divide by count
            </div>
          </div>
          
          <div style={{ 
            padding: 20, 
            background: COLORS.background, 
            borderRadius: 12,
            borderLeft: `4px solid ${COLORS.green}`
          }}>
            <div style={{ color: COLORS.green, fontSize: 14, marginBottom: 8, fontFamily: 'Georgia, serif' }}>MEDIAN (Middle)</div>
            <div style={{ color: COLORS.text, fontSize: 28, fontFamily: 'Georgia, serif' }}>
              <AnimatedNumber value={median} />
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 8 }}>
              Middle value when sorted
            </div>
          </div>
          
          <div style={{ 
            padding: 20, 
            background: COLORS.background, 
            borderRadius: 12,
            borderLeft: `4px solid ${COLORS.purple}`
          }}>
            <div style={{ color: COLORS.purple, fontSize: 14, marginBottom: 8, fontFamily: 'Georgia, serif' }}>MODE (Most Common)</div>
            <div style={{ color: COLORS.text, fontSize: 28, fontFamily: 'Georgia, serif' }}>
              {mode.join(', ')}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 8 }}>
              Value that appears most often
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lesson content mapper
const getLessonContent = (contentId) => {
  switch (contentId) {
    case 'fractions': return <FractionsLesson />;
    case 'equations': return <EquationsLesson />;
    case 'linear': return <LinearLesson />;
    case 'pythagorean': return <PythagoreanLesson />;
    case 'statistics': return <StatisticsLesson />;
    default: return (
      <div style={{ 
        padding: 48, 
        textAlign: 'center', 
        color: COLORS.textMuted,
        fontFamily: 'Georgia, serif'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <div style={{ fontSize: 20 }}>This lesson is coming soon!</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>We're working hard to create beautiful visualizations for this topic.</div>
      </div>
    );
  }
};

// Main App Component
function GEDMathApp() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  
  const totalLessons = topics.reduce((sum, t) => sum + t.lessons.length, 0);
  const progress = (completedLessons.size / totalLessons) * 100;
  
  const markComplete = () => {
    if (selectedLesson) {
      setCompletedLessons(prev => new Set([...prev, selectedLesson.id]));
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      color: COLORS.text,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes drawLine {
          from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px ${COLORS.blue}40; }
          50% { box-shadow: 0 0 40px ${COLORS.blue}60; }
        }
        
        * { box-sizing: border-box; }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${COLORS.backgroundDark};
        }
        ::-webkit-scrollbar-thumb {
          background: ${COLORS.gridLine};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${COLORS.textMuted};
        }
      `}</style>
      
      {/* Header */}
      <header style={{
        padding: '24px 48px',
        borderBottom: `1px solid ${COLORS.gridLine}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: `linear-gradient(to bottom, ${COLORS.backgroundDark}, ${COLORS.background})`
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
          onClick={() => { setSelectedTopic(null); setSelectedLesson(null); }}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.brown})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: COLORS.backgroundDark,
            boxShadow: `0 0 30px ${COLORS.blue}40`
          }}>
            π
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 24, 
              fontFamily: 'Georgia, serif',
              background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.gold})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GED Math Visualized
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted }}>
              Learn mathematics through visual intuition
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Progress</div>
            <div style={{ fontSize: 18, color: COLORS.blue }}>{completedLessons.size}/{totalLessons} lessons</div>
          </div>
          <ProgressRing progress={progress} />
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ padding: 48 }}>
        {!selectedLesson ? (
          // Topic Selection View
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ 
              fontFamily: 'Georgia, serif', 
              fontSize: 36, 
              fontWeight: 400,
              marginBottom: 8,
              color: COLORS.cream
            }}>
              {selectedTopic ? topics.find(t => t.id === selectedTopic)?.title : 'Choose a Topic'}
            </h2>
            <p style={{ color: COLORS.textMuted, marginBottom: 48, fontSize: 18 }}>
              {selectedTopic 
                ? 'Select a lesson to begin learning' 
                : 'Master GED Math through beautiful, intuitive visualizations'}
            </p>
            
            {!selectedTopic ? (
              // Topics Grid
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: 24 
              }}>
                {topics.map((topic, i) => {
                  const completedInTopic = topic.lessons.filter(l => completedLessons.has(l.id)).length;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.backgroundDark} 0%, ${COLORS.background} 100%)`,
                        border: `1px solid ${COLORS.gridLine}`,
                        borderRadius: 16,
                        padding: 32,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = topic.color;
                        e.currentTarget.style.boxShadow = `0 20px 40px ${topic.color}20`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = COLORS.gridLine;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: `${topic.color}10`,
                        filter: 'blur(30px)'
                      }} />
                      
                      <div style={{
                        fontSize: 48,
                        marginBottom: 16,
                        color: topic.color,
                        fontFamily: 'Georgia, serif'
                      }}>
                        {topic.icon}
                      </div>
                      <h3 style={{ 
                        fontSize: 22, 
                        fontFamily: 'Georgia, serif',
                        margin: '0 0 8px 0',
                        color: COLORS.text
                      }}>
                        {topic.title}
                      </h3>
                      <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
                        {topic.lessons.length} lessons • {completedInTopic} completed
                      </p>
                      
                      {/* Progress bar */}
                      <div style={{ 
                        marginTop: 16, 
                        height: 4, 
                        background: COLORS.gridLine, 
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(completedInTopic / topic.lessons.length) * 100}%`,
                          height: '100%',
                          background: topic.color,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Lessons List
              <div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: COLORS.blue,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  ← Back to Topics
                </button>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {topics.find(t => t.id === selectedTopic)?.lessons.map((lesson, i) => {
                    const isComplete = completedLessons.has(lesson.id);
                    const topicColor = topics.find(t => t.id === selectedTopic)?.color;
                    
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        style={{
                          background: COLORS.backgroundDark,
                          border: `1px solid ${isComplete ? topicColor : COLORS.gridLine}`,
                          borderRadius: 12,
                          padding: 24,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 20,
                          animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = topicColor;
                          e.currentTarget.style.transform = 'translateX(8px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = isComplete ? topicColor : COLORS.gridLine;
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: isComplete ? topicColor : COLORS.gridLine,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          color: isComplete ? COLORS.backgroundDark : COLORS.textMuted,
                          transition: 'all 0.3s ease'
                        }}>
                          {isComplete ? '✓' : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            margin: 0, 
                            fontSize: 18, 
                            fontFamily: 'Georgia, serif',
                            color: COLORS.text
                          }}>
                            {lesson.title}
                          </h4>
                        </div>
                        <div style={{ color: topicColor, fontSize: 20 }}>→</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Lesson View
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <button
              onClick={() => setSelectedLesson(null)}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.blue,
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'Georgia, serif'
              }}
            >
              ← Back to {topics.find(t => t.id === selectedTopic)?.title}
            </button>
            
            <h2 style={{ 
              fontFamily: 'Georgia, serif', 
              fontSize: 36, 
              fontWeight: 400,
              marginBottom: 32,
              color: COLORS.cream
            }}>
              {selectedLesson.title}
            </h2>
            
            {getLessonContent(selectedLesson.content)}
            
            <div style={{ 
              marginTop: 48, 
              display: 'flex', 
              justifyContent: 'center',
              gap: 16 
            }}>
              {!completedLessons.has(selectedLesson.id) ? (
                <button
                  onClick={markComplete}
                  style={{
                    padding: '16px 48px',
                    background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.blue})`,
                    border: 'none',
                    borderRadius: 12,
                    color: COLORS.backgroundDark,
                    fontSize: 18,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Georgia, serif',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 10px 30px ${COLORS.green}40`
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 15px 40px ${COLORS.green}60`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${COLORS.green}40`;
                  }}
                >
                  ✓ Mark as Complete
                </button>
              ) : (
                <div style={{
                  padding: '16px 48px',
                  background: COLORS.backgroundDark,
                  border: `2px solid ${COLORS.green}`,
                  borderRadius: 12,
                  color: COLORS.green,
                  fontSize: 18,
                  fontFamily: 'Georgia, serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  ✓ Completed
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer style={{
        padding: '24px 48px',
        borderTop: `1px solid ${COLORS.gridLine}`,
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 14
      }}>
        <p style={{ margin: 0 }}>
          Inspired by <a href="https://www.3blue1brown.com" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.blue, textDecoration: 'none' }}>3Blue1Brown</a>'s 
          approach to visual mathematics education
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: 12 }}>
          Built for the Plainfield Public Library Adult Literacy Program
        </p>
      </footer>
    </div>
  );
}
