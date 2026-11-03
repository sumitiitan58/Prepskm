import test from 'node:test';
import assert from 'node:assert/strict';
import { getValidSubjectsForExam, filterQuestionsForExam, calculateNTAScore } from './testRules';
import { Question } from '../types';

test('JEE Main and Advanced strictly allow only Physics, Chemistry, and Mathematics', () => {
  const jeeMainSubs = getValidSubjectsForExam('JEE Main');
  assert.deepEqual(jeeMainSubs, ['Physics', 'Chemistry', 'Mathematics']);
  assert.equal(jeeMainSubs.includes('Biology'), false);

  const jeeAdvSubs = getValidSubjectsForExam('JEE Advanced');
  assert.deepEqual(jeeAdvSubs, ['Physics', 'Chemistry', 'Mathematics']);
  assert.equal(jeeAdvSubs.includes('Biology'), false);
});

test('NEET strictly allows only Physics, Chemistry, and Biology', () => {
  const neetSubs = getValidSubjectsForExam('NEET');
  assert.deepEqual(neetSubs, ['Physics', 'Chemistry', 'Biology']);
  assert.equal(neetSubs.includes('Mathematics'), false);
});

test('filterQuestionsForExam strictly excludes Biology questions when JEE is selected', () => {
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      targetExam: 'JEE Main',
      classLevel: 'Class 12',
      subject: 'Physics',
      chapter: 'Kinematics',
      type: 'single_choice',
      difficulty: 'medium',
      text: 'What is acceleration?',
      options: [{ id: 'opt1', text: 'dv/dt', isCorrect: true }],
      explanationText: '',
      createdAt: ''
    },
    {
      id: 'q2',
      targetExam: 'NEET',
      classLevel: 'Class 12',
      subject: 'Biology',
      chapter: 'Genetics',
      type: 'single_choice',
      difficulty: 'easy',
      text: 'Who is the father of genetics?',
      options: [{ id: 'opt2', text: 'Mendel', isCorrect: true }],
      explanationText: '',
      createdAt: ''
    },
    {
      id: 'q3',
      targetExam: 'JEE Main',
      classLevel: 'Class 12',
      subject: 'Mathematics',
      chapter: 'Calculus',
      type: 'single_choice',
      difficulty: 'hard',
      text: 'Integral of sin(x)?',
      options: [{ id: 'opt3', text: '-cos(x)', isCorrect: true }],
      explanationText: '',
      createdAt: ''
    }
  ];

  const jeeFiltered = filterQuestionsForExam(mockQuestions, 'JEE Main');
  assert.equal(jeeFiltered.length, 2);
  assert.equal(jeeFiltered.some(q => q.subject === 'Biology'), false);
  assert.deepEqual(jeeFiltered.map(q => q.id), ['q1', 'q3']);

  const neetFiltered = filterQuestionsForExam(mockQuestions, 'NEET');
  assert.equal(neetFiltered.length, 2);
  assert.equal(neetFiltered.some(q => q.subject === 'Mathematics'), false);
  assert.deepEqual(neetFiltered.map(q => q.id), ['q1', 'q2']);
});

test('calculateNTAScore calculates +4 for correct, -1 for incorrect, and 0 for unattempted', () => {
  const testQ: Question[] = [
    {
      id: 'q1',
      targetExam: 'JEE Main',
      classLevel: 'Class 12',
      subject: 'Physics',
      chapter: 'Kinematics',
      type: 'single_choice',
      difficulty: 'medium',
      text: 'Q1',
      options: [
        { id: 'optA', text: 'A', isCorrect: true },
        { id: 'optB', text: 'B', isCorrect: false }
      ],
      explanationText: '',
      createdAt: ''
    },
    {
      id: 'q2',
      targetExam: 'JEE Main',
      classLevel: 'Class 12',
      subject: 'Chemistry',
      chapter: 'Bonding',
      type: 'single_choice',
      difficulty: 'medium',
      text: 'Q2',
      options: [
        { id: 'optA', text: 'A', isCorrect: true },
        { id: 'optB', text: 'B', isCorrect: false }
      ],
      explanationText: '',
      createdAt: ''
    },
    {
      id: 'q3',
      targetExam: 'JEE Main',
      classLevel: 'Class 12',
      subject: 'Mathematics',
      chapter: 'Matrices',
      type: 'numerical',
      difficulty: 'medium',
      text: 'Q3',
      options: [],
      numericalAnswer: 42,
      numericalTolerance: 0.1,
      explanationText: '',
      createdAt: ''
    },
    {
      id: 'q4',
      targetExam: 'JEE Main',
      classLevel: 'Class 12',
      subject: 'Physics',
      chapter: 'Optics',
      type: 'single_choice',
      difficulty: 'easy',
      text: 'Q4',
      options: [{ id: 'optA', text: 'A', isCorrect: true }],
      explanationText: '',
      createdAt: ''
    }
  ];

  const userAnswers = {
    q1: { selectedOptionIds: ['optA'] }, // +4
    q2: { selectedOptionIds: ['optB'] }, // -1
    q3: { numericalInput: '42' },        // +4
    // q4 unattempted: 0
  };

  const report = calculateNTAScore(testQ, userAnswers);
  assert.equal(report.score, 7); // 4 - 1 + 4 + 0 = 7
  assert.equal(report.maxScore, 16);
  assert.equal(report.correctCount, 2);
  assert.equal(report.incorrectCount, 1);
  assert.equal(report.unattemptedCount, 1);
  assert.equal(report.accuracy, 67); // 2/3 attempted ~ 67%
});
