import { Question, SubjectName, ExamTarget } from '../types';

export function getValidSubjectsForExam(examTarget: ExamTarget): SubjectName[] {
  if (examTarget === 'JEE Main' || examTarget === 'JEE Advanced') {
    return ['Physics', 'Chemistry', 'Mathematics'];
  }
  if (examTarget === 'NEET') {
    return ['Physics', 'Chemistry', 'Biology'];
  }
  return ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
}

export function filterQuestionsForExam(
  questions: Question[],
  examTarget: ExamTarget,
  chosenSubjects?: SubjectName[]
): Question[] {
  const isJEE = examTarget === 'JEE Main' || examTarget === 'JEE Advanced';
  const isNEET = examTarget === 'NEET';
  const allowed = getValidSubjectsForExam(examTarget);
  const activeSubs = chosenSubjects
    ? chosenSubjects.filter((s) => allowed.includes(s))
    : allowed;

  return questions.filter((q) => {
    // Strict JEE rule: never allow Biology
    if (isJEE && q.subject === 'Biology') return false;
    // Strict NEET rule: never allow Mathematics
    if (isNEET && q.subject === 'Mathematics') return false;
    return activeSubs.includes(q.subject);
  });
}

export interface ScoreReport {
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
}

export function calculateNTAScore(
  questions: Question[],
  userAnswers: Record<string, { selectedOptionIds?: string[]; numericalInput?: string }>
): ScoreReport {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  for (const q of questions) {
    const ans = userAnswers[q.id];
    if (!ans) {
      unattemptedCount++;
      continue;
    }

    if (q.type === 'numerical') {
      const inputVal = ans.numericalInput !== undefined && ans.numericalInput.trim() !== ''
        ? parseFloat(ans.numericalInput.trim())
        : null;

      if (inputVal === null || isNaN(inputVal)) {
        unattemptedCount++;
      } else {
        const expected = q.numericalAnswer ?? 0;
        const tol = q.numericalTolerance ?? 0.05;
        const isCorrect = Math.abs(inputVal - expected) <= tol;

        if (isCorrect) {
          score += 4;
          correctCount++;
        } else {
          score -= 1;
          incorrectCount++;
        }
      }
    } else {
      const selected = ans.selectedOptionIds || [];
      if (selected.length === 0) {
        unattemptedCount++;
      } else {
        const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
        const isCorrect =
          selected.length === correctIds.length &&
          selected.every((id) => correctIds.includes(id));

        if (isCorrect) {
          score += 4;
          correctCount++;
        } else {
          score -= 1;
          incorrectCount++;
        }
      }
    }
  }

  const maxScore = questions.length * 4;
  const attempted = correctCount + incorrectCount;
  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

  return {
    score,
    maxScore,
    correctCount,
    incorrectCount,
    unattemptedCount,
    accuracy,
  };
}
