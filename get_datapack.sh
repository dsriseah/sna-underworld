# get_datapack.sh
FILE="underworld"

# ANSI Terminal Colors
ALRT="\033[33;1m" # yellow
INFO="\033[34;1m" # blue
NRML="\033[0m"    # normal
BOLD="\033[1m"    # normal bold

# ensure that app-static/_datapack directory exists
if [ ! -d "app-static/_datapack" ]; then
    mkdir -p app-static/_datapack
fi

printf "Downloading the asset datapack ${INFO}$FILE.tgz${NRML}...\n"

# use curl to get the file at https://dsriseah.com/_tarballs/datapack/FILE
curl -L -sS -o app-static/_datapack/underworld.tgz https://dsriseah.com/_tarballs/datapack/$FILE.tgz

# check if the file was downloaded successfully
if [ $? -ne 0 ]; then
    printf "\n"
    printf "${ALRT}Failed to download the file${NRML}\n"
    exit 1
fi
# extract the file to app-static/_datapack
tar -xzf app-static/_datapack/underworld.tgz -C app-static/_datapack
# check if the extraction was successful
if [ $? -ne 0 ]; then
    printf "\n"
    printf "${ALRT}Failed to extract the file${NRML}\n"
    exit 1
fi
# remove the tarball
rm app-static/_datapack/underworld.tgz
# check if the removal was successful
if [ $? -ne 0 ]; then
    printf "\n"
    printf "${ALRT}Failed to remove the tarball${NRML}\n"
    exit 1
fi  
# print the success message
printf "Asset datapack installed at ${INFO}app-static/_datapack/${FILE}/${NRML}\n"

# printf current working directory
printf "\n"

