export const log = async (error) => {
  try {
    if (process.env.env === "development") {
      return;
    }

    let errorMessage;
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = `${error.message}\n${error.stack}`;
    } else if (error instanceof Response) {
      const stackTrace = new Error().stack;
      const text = await error.text();
      errorMessage = `${error.status} ${error.statusText}\n${text}`;
      errorMessage += `\n${stackTrace}`;
    } else {
      errorMessage = JSON.stringify(error);
    }

    //TODO: send error to a logging service
    console.log("Error: ", errorMessage);
  } catch (notifyError) {
    console.error(notifyError);
  }
};
