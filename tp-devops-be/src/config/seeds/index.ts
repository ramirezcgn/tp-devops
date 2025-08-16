import TodoSeed from './todos';

export default () =>
  Promise.all([
    // Returning and thus passing a Promise here
    // Independent seeds first
    TodoSeed(),
  ])
    .then(() => {
      // More seeds that require IDs from the seeds above
    })
    .then(() => {
      console.log('********** Successfully seeded db **********');
    });
