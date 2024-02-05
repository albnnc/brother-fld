```bash
# Show help
cli.ts -h

# Compile CLI bin
deno compile -A --unstable-ffi -o cli ./cli.ts

# Pack static website
./cli pack -i ./_examples/plain -o ./test

# Start obfuscated website
./test
```
