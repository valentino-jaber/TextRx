const config = new Configuration({
    apiKey: "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",
  });
  
  const openai = new OpenAIApi(config);
  let userInput = "";
  
  const runGptPrompt = async () => {
    let prompt = "Say Hi";
  
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.5,
    });
  
    let answer = response.data.choices[0].text;
    console.log(answer);
  };
  
  // runGptPrompt(); // You might want to remove this call as it runs on page load now
  