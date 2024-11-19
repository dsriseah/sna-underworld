# zip_dist.sh - create a zip file of distribution files
# it uses the package.json name and the github branch date as the zip file name
# syntax: zip_dist.sh directory_to_zip 

# ANSI Terminal Colors
ALRT="\033[33;1m" # yellow
INFO="\033[34;1m" # blue
NRML="\033[0m"    # normal
BOLD="\033[1m"    # normal bold

# get the script name without extension
NOM=$(basename "$0" .sh)
# SPC is string of spaces the same length as $NOM
SPC=$(printf "%*s" ${#NOM} | tr ' ' ' ')

# Check that $1 is provided
if [ -z "$1" ]; then
  printf "\n"
  printf "$NOM: ${ALRT}ARG1 must be a directory path${NRML}\n"
  printf "\n"
  exit 1
fi

# Check if directory_to_zip exists
if [ ! -d "$1" ]; then
  printf "\n"
  printf "$NOM: ${ALRT}'$1' does not exist${NRML}\n"
  printf "$SPC  Please provide a valid directory path.\n"
  printf "\n"
  exit 1
fi

# starting from current directory, recursively list all parent directories
# until the package.json file is found
PNAME=""
DIR=$(pwd)
while [ "$DIR" != "/" ]; do
  if [ -f "$DIR/package.json" ]; then
    PNAME=$(basename "$DIR")
    break
  fi
  DIR=$(dirname "$DIR")
done
if [ -z "$PNAME" ]; then
  printf "\n"
  printf "$NOM: ${ALRT}package.json not found in any parent directory${NRML}\n"
  printf "\n"
  exit 1
fi

# get a date string from the current git branch HEAD, formatted as YYDDMM-HHMM
BDATE=$(git show -s --format=%cd --date=format:%Y-%m%d)
# get the current branch name
BNAME=$(git rev-parse --abbrev-ref HEAD)
# get the short SHA of the current commit
SHA=$(git rev-parse --short HEAD)
# create the zip file name
ZNAME="$PNAME $BDATE $BNAME #$SHA.zip"
# replace spaces with "\ " in ZNAME
ZSRC="$1/*"
# zip the directory
printf "\n"
printf "${INFO}Creating zip file:${NRML}\n"
printf "zip -r ${ZNAME} $1/*\n"
zip -r "${ZNAME}" $ZSRC

# printf current working directory
printf "\n"

