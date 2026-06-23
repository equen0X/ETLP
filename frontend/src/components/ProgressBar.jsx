function ProgressBar({ progress }) {

  return (
    <div>

      <div className="progress">

        <div
          className="progress-bar"
          role="progressbar"
          style={{
            width: `${progress}%`
          }}
        >
          {progress}%
        </div>

      </div>

    </div>
  );
}

export default ProgressBar;