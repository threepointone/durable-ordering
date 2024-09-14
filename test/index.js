const ctrs = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const NUM_REQUESTS = 40;

// const HOST = "http://127.0.0.1:8787";
const HOST = "https://durable-ordering.threepointone.workers.dev";

async function run() {
  console.log("Running test, this may take a few seconds...");
  await fetch(`${HOST}/reset`);
  for (let i = 0; i < NUM_REQUESTS; i++) {
    fetch(`${HOST}/increment`)
      .then((res) => res.text())
      .then((text) => {
        ctrs.push(parseInt(text));
        if (ctrs.length === NUM_REQUESTS) {
          console.log("Final counter array:", ctrs);
          test();
        }
      });

    await sleep(50);
  }
}

function test() {
  const mismatches = [];
  for (let i = 0; i < ctrs.length; i++) {
    if (ctrs[i] !== i + 1) {
      mismatches.push([i, ctrs[i]]);
    }
  }
  if (mismatches.length > 0) {
    console.log(
      `Mismatches found: ${mismatches.length} at indices:`,
      mismatches.map(([i, c]) => i)
    );
  } else {
    console.log("All good");
  }
}

run();
